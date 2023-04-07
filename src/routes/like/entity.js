const Like = require('../../models/Like');
const Auction = require('../../models/Auction');
const Trade = require('../../models/Trade');
const User = require('../../models/User');
const UserSteamItems = require('../../models/UserSteamItems');

const addSkinToUserRecommendation = require('../../helpers/addSkinToUserRecommendation');
const sendPushV3 = require('../../helpers/sendPushV3');
const reportQuest = require('../../helpers/reportQuest');
const i18n = require('../../languages');

const newLikeSkin = async req => {
  const likeDocument = await Like.findOne({
    steamId: req.user.steamId,
    entityType: req.params.eType,
    entityId: req.params.eid,
  });

  if (likeDocument) {
    await likeDocument.remove();
    return { status: 'success', like: false };
  }

  const inventory = await UserSteamItems.findOne({ 'steamItems.assetid': req.params.eid });
  if (!inventory || !inventory.steamId) {
    return { status: 'error', code: 0, message: 'inventory not found' };
  }
  let skin = inventory.steamItems.find(item => {
    return item.assetid == req.params.eid;
  });
  const user = await User.findOne({ steamId: inventory.steamId });
  if (!user || !user.personaname) {
    return { status: 'error', code: 1, message: 'user not found' };
  }

  await new Like({
    steamId: req.user.steamId,
    entityType: req.params.eType,
    entityId: req.params.eid,
  }).save();

  await sendPushV3(user, {
    type: 'SKIN_INFO',
    steamId: user.steamId,
    assetId: req.params.eid,
    title: i18n((user.locale || 'en').toLowerCase()).newLike.skin.replace('{user}', req.user.personaname),
    content: skin.name,
  });

  await addSkinToUserRecommendation(req.user.steamId, inventory.appId, req.params.eid);

  await reportQuest(req.user, 'like');
  return { status: 'success', like: true };
};

const newLikeAuction = async req => {
  const auction = await Auction.findOne({ _id: req.params.eid }).populate('user');
  if (!auction) {
    return { status: 'error', code: 20, message: 'auction not found' };
  }

  auction.likes = auction.likes || [];
  if (auction.likes.indexOf(req.user.steamId) > -1) {
    auction.likes = auction.likes.filter(sid => sid !== req.user.steamId);
    await Auction.updateOne(
      { _id: auction._id },
      {
        $set: { likes: auction.likes },
      },
    );
    return { status: 'success', like: false };
  }

  auction.likes.push(req.user.steamId);

  await Auction.updateOne(
    { _id: auction._id },
    {
      $set: { likes: auction.likes },
    },
  );
  await sendPushV3(auction.user, {
    type: 'AUCTION_INFO',
    auctionId: auction._id,
    title: i18n((auction.user.locale || 'en').toLowerCase()).newLike.auction.replace('{user}', req.user.personaname),
    content: ' ',
  });
  await reportQuest(req.user, 'like');
  return { status: 'success', like: true };
};

const newLikeTrade = async req => {
  const trade = await Trade.findOne({ _id: req.params.eid }).populate('user1');
  if (!trade) {
    return { status: 'error', code: 10, message: 'trade not found' };
  }

  trade.likes = trade.likes || [];
  if (trade.likes.indexOf(req.user.steamId) > -1) {
    trade.likes = trade.likes.filter(sid => sid !== req.user.steamId);
    await Trade.updateOne(
      { _id: trade._id },
      {
        $set: { likes: trade.likes },
      },
    );
    return { status: 'success', like: false };
  }

  trade.likes.push(req.user.steamId);
  await sendPushV3(trade.user1, {
    type: 'TRADE_INFO',
    tradeId: trade._id,
    title: i18n((trade.user1.locale || 'en').toLowerCase()).newLike.trade.replace('{user}', req.user.personaname),
    content: ' ',
  });
  await Trade.updateOne(
    { _id: trade._id },
    {
      $set: { likes: trade.likes },
    },
  );

  await reportQuest(req.user, 'like');
  return { status: 'success', like: true };
};

module.exports = async function process(req) {
  if (req.params.eType === 'skin') {
    return newLikeSkin(req);
  }
  if (req.params.eType === 'trade') {
    return newLikeTrade(req);
  }
  if (req.params.eType === 'auction') {
    return newLikeAuction(req);
  }

  return { status: 'error', code: 0, message: 'no such eType' };
};
