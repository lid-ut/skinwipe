const Comment = require('../../models/Comment');
const Trade = require('../../models/Trade');
const User = require('../../models/User');
const Auction = require('../../models/Auction');
const UserSteamItems = require('../../models/UserSteamItems');
const sendPushV3 = require('../../helpers/sendPushV3');
const getNameAndTag = require('../../helpers/getNameAndTag');
const reportQuest = require('../../helpers/reportQuest');
const addSkinToUserRecommendation = require('../../helpers/addSkinToUserRecommendation');
const i18n = require('../../languages');

async function getAuctionPreview(eid) {
  const auction = await Auction.findOne({ _id: eid }).populate('user');
  if (!auction) {
    return null;
  }
  return {
    items: auction.items,
    itemsCount: auction.items.length,
    allSkinsPrice: auction.allSkinsPrice,
    personaname: auction.user.personaname,
    steamId: auction.user.steamId,
    avatar: auction.user.avatarfull,
    avatarmedium: auction.user.avatarfull,
    subscriber: auction.user.subscriber,
    date: auction.createdAt,
  };
}

async function getTradePreview(eid) {
  const trade = await Trade.findOne({ _id: eid }).populate('user1 user2').lean();
  if (!trade) {
    return null;
  }
  if (!trade.user2) {
    trade.user2 = {
      avatar: 'Bomb',
      avatarmedium: 'Bomb',
      personaname: 'Super-Trade',
      bans: {},
      tradeUrl: '',
      subscriber: false,
      allSkinsCount: 1,
      steamId: 'noSteamId',
    };
  }
  return {
    itemsCount: trade.items.length,
    allSkinsPrice: trade.myAllSkinsPrice,
    personaname: trade.user1.personaname,
    steamId: trade.user1.steamId,
    partnerSteamId: trade.user2.steamId,
    avatar: trade.user1.avatarfull,
    avatarmedium: trade.user1.avatarfull,
    subscriber: trade.user1.subscriber,
    date: trade.createdAt,
  };
}

async function getSkinPreview(eid) {
  const inventory = await UserSteamItems.findOne({ 'steamItems.assetid': eid });
  if (!inventory || !inventory.steamItems) {
    return null;
  }

  const skin = inventory.steamItems.find(sk => sk.assetid === eid);
  if (skin.float === undefined || skin.float === 'wait...') {
    skin.float = null;
  }
  const nameTag = getNameAndTag(skin);
  return {
    price: skin.price,
    assetid: skin.assetid,
    userSteamId: skin.userSteamId,
    appid: skin.appid,
    name: nameTag.name,
    ExteriorMin: nameTag.tag,
    image_small: skin.image_small,
    image_large: skin.image_large,
    stickerPics: skin.stickerPics || [], // CSGO
    stickerNames: skin.stickerNames || [], // CSGO
    runePics: skin.runePics || [], // DOTA
    runeNames: skin.runeNames || [], // DOTA
    runeTypes: skin.runeTypes || [], // DOTA
    paintWear: skin.float === null ? null : parseFloat(skin.float.substr(0, 10)),
    float: skin.float === null ? null : skin.float.substr(0, 10),
  };
}

module.exports = async function process(req) {
  if (!req.body.message || !req.body.message.trim().length) {
    return { status: 'error', code: 2, message: 'Empty message' };
  }
  if (req.user.chatBanned) {
    return { status: 'error', code: 4, message: 'Muted' };
  }
  let entityPreview = null;
  if (req.params.eType === 'skin') {
    entityPreview = await getSkinPreview(req.params.eid);
    if (entityPreview && entityPreview.userSteamId && req.user.steamId !== entityPreview.userSteamId) {
      const user = await User.findOne({ steamId: entityPreview.userSteamId });
      if (user.blacklist && user.blacklist.indexOf(req.user.steamId) > -1) {
        return { status: 'error', code: 3, message: 'Blacklisted' };
      }
      await sendPushV3(user, {
        type: 'SKIN_INFO',
        steamId: user.steamId,
        assetId: req.params.eid,
        title: i18n((user.locale || 'en').toLowerCase()).newComment.skin.replace('{user}', req.user.personaname),
        content: req.body.message,
        platform: 'android',
      });
      await addSkinToUserRecommendation(req.user.steamId, entityPreview.appid, req.params.eid);
    }
  } else if (req.params.eType === 'trade') {
    entityPreview = await getTradePreview(req.params.eid);
    if (entityPreview && entityPreview.steamId) {
      const user = await User.findOne({ steamId: entityPreview.steamId });
      const partner = await User.findOne({ steamId: entityPreview.partnerSteamId });
      if (user.blacklist && user.blacklist.indexOf(req.user.steamId) > -1) {
        return { status: 'error', code: 3, message: 'Blacklisted' };
      }
      if (user.steamId !== req.user.steamId) {
        await sendPushV3(user, {
          type: 'TRADE_INFO',
          tradeId: req.params.eid,
          title: i18n((user.locale || 'en').toLowerCase()).newComment.trade.replace('{user}', req.user.personaname),
          content: req.body.message,
          platform: 'android',
        });
      }
      if (partner && partner.steamId !== req.user.steamId) {
        await sendPushV3(partner, {
          type: 'TRADE_INFO',
          tradeId: req.params.eid,
          title: i18n((partner.locale || 'en').toLowerCase()).newComment.partnerTrade.replace('{user}', req.user.personaname),
          content: req.body.message,
          platform: 'android',
        });
      }
    }
  } else if (req.params.eType === 'auction') {
    entityPreview = await getAuctionPreview(req.params.eid, req.user.personaname, req.body.message);
    if (entityPreview && entityPreview.steamId && req.user.steamId !== entityPreview.steamId) {
      const user = await User.findOne({ steamId: entityPreview.steamId });
      if (user.blacklist && user.blacklist.indexOf(req.user.steamId) > -1) {
        return { status: 'error', code: 3, message: 'Blacklisted' };
      }
      await sendPushV3(user, {
        type: 'AUCTION_INFO',
        auctionId: req.params.eid,
        title: i18n((user.locale || 'en').toLowerCase()).newComment.auction.replace('{user}', req.user.personaname),
        content: req.body.message,
        platform: 'android',
      });
      for (let i = 0; i < entityPreview.items.length; i++) {
        let item = entityPreview.items[i];
        await addSkinToUserRecommendation(req.user.steamId, item.appid, item.assetid);
      }
    }
  }

  if (!entityPreview) {
    return { status: 'error', code: 1, message: 'Entity not found' };
  }

  const comment = new Comment({
    user: req.user._id,
    steamId: req.user.steamId,
    entityType: req.params.eType,
    entityId: req.params.eid,
    entityPreview,
    comment: req.body.message,
  });
  await comment.save();
  await reportQuest(req.user, 'comment');
  return {
    status: 'success',
    result: {
      _id: comment._id,
      date: comment.createdAt,
      comment: comment.comment,
      steamId: req.user.steamId,
      personaname: req.user.personaname,
      avatar: req.user.avatarfull,
      subscriber: req.user.subscriber,
    },
  };
};
