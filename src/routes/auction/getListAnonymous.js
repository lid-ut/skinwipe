const Auction = require('../../models/Auction');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
const getNameAndTag = require('../../helpers/getNameAndTag');
const processItem = require('../../helpers/processItem');
const getShortUserInfo = require('../../helpers/getShortUserInfo');

const sortItemsByPrice = (a, b) => {
  if (!a.price || !a.price.steam || !a.price.steam.mean) {
    return -1;
  }
  if (!b.price || !b.price.steam || !b.price.steam.mean) {
    return 1;
  }
  if (a.price.steam.mean < b.price.steam.mean) {
    return 1;
  }
  if (a.price.steam.mean > b.price.steam.mean) {
    return -1;
  }
  return 0;
};

const sortByPrice2 = (a, b) => {
  if (!(a.trade && b.trade)) return -1;

  if (a.trade.hisAllSkinsPrice < b.trade.hisAllSkinsPrice) {
    return 1;
  }
  if (a.trade.hisAllSkinsPrice > b.trade.hisAllSkinsPrice) {
    return -1;
  }
  return 0;
};

const getUserBySteamId = async steamId => {
  if (!steamId) {
    logger.error('no steamid');
    return null;
  }
  const user = await User.findOne({ steamId }).lean();
  if (!user) {
    logger.error('no user');
    return null;
  }
  return user;
};

const fillV2 = async auction => {
  if (!auction || !auction.bets) {
    return { error: { code: 777, message: 'no auction' } };
  }
  if (!auction.user) {
    auction.user = await getUserBySteamId(auction.steamId);
  }
  if (!auction.user) {
    return { error: { code: 787, message: 'no auction user' } };
  }
  const itemsAuctions = [];
  for (let i = 0; i < auction.items.length; i++) {
    const item = auction.items[i];
    if (!item) {
      // eslint-disable-next-line no-continue
      continue;
    }
    let imageSmall = '';
    let imageLarge = '';

    if (item.image) {
      imageSmall = item.image;
      imageLarge = item.image;
    }
    if (item.image_small) {
      imageSmall = item.image_small;
    }

    if (item.image_large) {
      imageLarge = item.image_large;
    }

    if (item.price) {
      item.price = {
        steam: {
          mean: Math.round(item.price.steam.mean || 0),
          safe: Math.round(item.price.steam.mean || 0),
        },
      };
    } else {
      item.price = {
        steam: {
          mean: 0,
          safe: 0,
        },
      };
    }

    if (item.float && !item.paintWear) {
      item.paintWear = item.float;
    }
    itemsAuctions.push({
      name: getNameAndTag(item).name,
      image_small: imageSmall.replace('https://steamcommunity-a.akamaihd.net/economy/image/', ''),
      image_large: imageLarge.replace('https://steamcommunity-a.akamaihd.net/economy/image/', ''),
      userSteamId: item.userSteamId || '', // Какому юзеру принадлежит
      appid: parseInt(item.appid, 10) || 570,
      amount: 1, // Количество, для предметов имеющих данную величину
      assetid: item.assetid,
      contextid: `${item.contextid || 2}`,

      marketable: true, // 0 - нельзя продать, 1 - можно продать
      tradable: true, // Возможность передать предмет
      market_tradable_restriction: 0, // Дней бана после обмена

      Quality: item.Quality || item.quality_name, // CSGO, Dota2
      QualityName: item.QualityName || item.quality_type, // CSGO, Dota2
      QualityColor: item.QualityColor || item.border_color, // CSGO, Dota2
      Rarity: item.rarity || item.Rarity, // CSGO, Dota2
      RarityName: item.rarity || item.Rarity, // CSGO, Dota2
      RarityColor: item.rarity_color || item.RarityColor, // CSGO, Dota2
      Type: item.Type || 'no', // CSGO, Dota2
      Slot: item.Slot || 'no', // Dota2
      Hero: item.Hero || 'no', // Dota2
      Weapon: item.Weapon || 'no', // CSGO
      ItemSet: item.ItemSet || 'no', // CSGO
      ItemSetName: item.ItemSetName || 'no', // CSGO
      ExteriorMin: getNameAndTag(item).tag, // CSGO
      Exterior: item.Exterior,
      stickerPics: item.stickerPics || [], // CSGO
      stickerNames: item.stickerNames || [], // CSGO
      runePics: item.runePics || [], // DOTA
      runeNames: item.runeNames || [], // DOTA
      runeTypes: item.runeTypes || [], // DOTA
      nameTag: item.nameTag, // CSGO
      steamcat: item.steamcat,
      itemclass: item.itemclass,
      Game: item.Game,
      GameName: item.GameName,
      droprate: item.droprate,
      droprateName: item.droprateName,
      item_class: item.item_class,
      item_className: item.item_className,
      paintWear: item.paintWear === 'wait...' || item.paintWear === 'unavailable' ? null : parseFloat(item.paintWear),
      price: item.price,
    });
  }

  auction.comments = await Comment.find({ entityType: 'auction', entityId: auction._id.toString() }).populate('user');

  if (auction.minSkinPrice && parseInt(auction.minSkinPrice, 10) !== auction.minSkinPrice && auction.minSkinPrice % 1 !== 0) {
    auction.minSkinPrice = parseInt(auction.minSkinPrice.toFixed(2), 10) * 100;
  }
  if (auction.minBetPrice && parseInt(auction.minBetPrice, 10) !== auction.minBetPrice && auction.minBetPrice % 1 !== 0) {
    auction.minBetPrice = parseInt(auction.minBetPrice.toFixed(2), 10) * 100;
  }

  const auctionItem = {
    _id: auction._id,
    status: auction.status,

    createdAt: auction.createdAt,
    timeAgo: Math.floor((Date.now() - new Date(auction.createdAt).getTime()) / 1000),
    expiresAt: new Date(auction.expiresAt || new Date(auction.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),

    steamId: auction.steamId,
    user: getShortUserInfo(auction.user),

    allSkinsPrice: auction.allSkinsPrice,
    items: itemsAuctions,

    message: !auction.user.chatBanned ? auction.message : '',
    premium: auction.premium || auction.user.subscriber,

    disableComments: !!auction.disableComments,
    games: auction.games || ['730', '570'],
    minSkinPrice: auction.minSkinPrice || 0,
    minBetPrice: auction.minBetPrice || 0,

    likes: (auction.likes || []).length,
    didILikeThis: false,

    comments: (auction.comments || []).map(com => {
      return {
        _id: com._id,
        date: com.createdAt,
        comment: com.comment,
        steamId: com.steamId,
        personaname: com.user.personaname,
        avatar: com.user.avatarfull,
        subscriber: com.user.subscriber,
      };
    }),

    bets: [],
  };

  if (auction.bets) {
    auction.bets.forEach(async bItem => {
      if (!bItem.steamId) return;
      const trade = bItem.tradeObject;
      if (!trade) return;
      if (!trade.myAllSkinsPrice) return;
      if (!trade.status) return;
      if (!auctionItem.user) return;
      let betUser = bItem.user;
      if (!betUser) {
        betUser = await getUserBySteamId(bItem.steamId);
      }
      if (!betUser) return;
      auctionItem.bets.push({
        createdAt: new Date(parseInt((bItem._id || auction._id).toString().substring(0, 8), 16) * 1000),
        steamId: bItem.steamId,
        user: getShortUserInfo(betUser),
        trade,
      });
    });
    for (let j = 0; j < auctionItem.bets.length; j++) {
      let bItem = auctionItem.bets[j];
      bItem.trade.user1 = bItem.user;
      bItem.trade.user2 = auctionItem.user;
      const trade = bItem.trade;

      const items = [];
      const itemsPartner = [];

      for (let i = 0; i < trade.items.length; i++) {
        items.push(await processItem(trade.items[i]));
      }
      for (let i = 0; i < auction.items.length; i++) {
        itemsPartner.push(await processItem(auction.items[i]));
      }

      items.sort(sortItemsByPrice);
      itemsPartner.sort(sortItemsByPrice);

      bItem.trade = {
        _id: trade._id,
        steamId: bItem.trade.user2.steamId,
        steamIdPartner: bItem.trade.user1.steamId,
        user: bItem.trade.user2,
        partner: bItem.trade.user1,
        items,
        itemsPartner,
        myAllSkinsPrice: Math.round(trade.hisAllSkinsPrice),
        hisAllSkinsPrice: Math.round(trade.myAllSkinsPrice),
        status: trade.status,
        steamTradeStatus: trade.steamTradeStatus,
        steamTradeID: trade.steamTradeID,
      };
      auctionItem.bets[j] = bItem;
    }
    auctionItem.bets.sort(sortByPrice2);
  }

  auctionItem.items.sort(sortItemsByPrice);
  return auctionItem;
};

const getTopPremAuction = async (findObj, sortObj) => {
  const auctions = await Auction.find({ ...findObj, premium: 1, subscriber: true })
    .sort(sortObj)
    .populate('user bets.user')
    .limit(1)
    .lean()
    .exec();
  return auctions[0];
};

const getListV2 = async params => {
  if (!params) {
    params = {};
  }
  params.limit = parseInt(params.limit || 0, 10);
  params.offset = parseInt(params.offset || 0, 10);

  const findObj = { status: 'open' };

  const topAuction = await getTopPremAuction(findObj, { dateCreate: -1 });
  if (params.offset === 0 && topAuction) {
    params.limit -= 1;
    findObj._id = { $ne: topAuction._id };
  }

  let auctions = await Auction.find(findObj)
    .sort({ dateCreate: -1 })
    .populate('user bets.user')
    .limit(params.limit)
    .skip(params.offset)
    .lean()
    .exec();

  if (!auctions) {
    auctions = [];
  }

  if (params.offset === 0 && topAuction) {
    auctions.unshift(topAuction);
  }

  return Promise.all(auctions.map(auction => fillV2(auction)));
};

module.exports = async (req, res) => {
  // eslint-disable-next-line no-undef
  if (redisClient && redisGet) {
    // eslint-disable-next-line no-undef
    const result = await redisGet(req.redisToken);
    if (result) {
      res.json(result);
      return;
    }
  }

  const params = {
    limit: req.body.limit || 20,
    offset: req.body.offset || 0,
  };

  const auctions = await getListV2(params);
  if (redisClient) {
    redisClient.setex(req.redisToken, 120, JSON.stringify({ status: 'success', auctions }));
  }
  res.json({ status: 'success', auctions });
};
