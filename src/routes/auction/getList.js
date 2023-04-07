const Auction = require('../../models/Auction');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
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

const sortBetsByPrice = (a, b) => {
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

const fillV2 = async (auction, steamId) => {
  if (!auction || !auction.bets) {
    return { error: { code: 777, message: 'no auction' } };
  }
  if (!auction.user) {
    auction.user = await getUserBySteamId(auction.steamId);
  }
  if (!auction.user) {
    return { error: { code: 787, message: 'no auction user' } };
  }
  auction.comments = await Comment.find({ entityType: 'auction', entityId: auction._id.toString() }).populate('user');

  if (auction.minSkinPrice && parseInt(auction.minSkinPrice, 10) !== auction.minSkinPrice && auction.minSkinPrice % 1 !== 0) {
    auction.minSkinPrice = parseInt(auction.minSkinPrice.toFixed(2), 10) * 100;
  }
  if (auction.minBetPrice && parseInt(auction.minBetPrice, 10) !== auction.minBetPrice && auction.minBetPrice % 1 !== 0) {
    auction.minBetPrice = parseInt(auction.minBetPrice.toFixed(2), 10) * 100;
  }

  auction.items = await Promise.all(auction.items.map(processItem));
  auction.items.sort(sortItemsByPrice);

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
    items: auction.items,

    message: !auction.user.chatBanned ? auction.message : '',
    premium: auction.premium || auction.user.subscriber,

    disableComments: !!auction.disableComments,
    games: auction.games || ['730', '570'],
    minSkinPrice: auction.minSkinPrice || 0,
    minBetPrice: auction.minBetPrice || 0,

    likes: (auction.likes || []).length,
    didILikeThis: !!(auction.likes || []).find(like => like === steamId),

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
      const bItem = auctionItem.bets[j];
      bItem.trade.user1 = bItem.user;
      bItem.trade.user2 = auctionItem.user;
      const trade = bItem.trade;

      // eslint-disable-next-line no-await-in-loop
      trade.items = await Promise.all(trade.items.map(processItem));
      trade.items.sort(sortItemsByPrice);

      bItem.trade = {
        _id: trade._id,
        steamId: bItem.trade.user2.steamId,
        steamIdPartner: bItem.trade.user1.steamId,
        user: bItem.trade.user2,
        partner: bItem.trade.user1,
        items: trade.items,
        itemsPartner: auction.items,
        myAllSkinsPrice: Math.round(trade.hisAllSkinsPrice),
        hisAllSkinsPrice: Math.round(trade.myAllSkinsPrice),
        status: trade.status,
        steamTradeStatus: trade.steamTradeStatus,
        steamTradeID: trade.steamTradeID,
      };
      auctionItem.bets[j] = bItem;
    }
    auctionItem.bets.sort(sortBetsByPrice);
  }

  return auctionItem;
};

const getTopPremAuction = async (findObj, sortObj) => {
  const auctions = await Auction.find({ ...findObj, premium: true, subscriber: true })
    .sort(sortObj)
    .populate('user bets.user')
    .limit(1)
    .lean()
    .exec();
  return auctions[0];
};

const getListV2 = async (user, params) => {
  let findObj = { status: 'open' }; // 'all'

  if (params.statusType === 'my') {
    findObj = { steamId: user.steamId };
  }
  if (params.statusType === 'active') {
    findObj = { 'bets.steamId': user.steamId };
  }

  if (params.filters) {
    if (params.filters.price && (params.filters.price.min || params.filters.price.max)) {
      findObj.allSkinsPrice = {
        $gte: params.filters.price.min || 0,
        $lte: params.filters.price.max || 9999999,
      };
    }
  }

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

  return Promise.all(auctions.map(auction => fillV2(auction, user.steamId)));
};

module.exports = async req => {
  const params = {
    offset: 0,
    limit: 20,
    statusType: 'all',
  };
  if (req.body.limit) {
    params.limit = parseInt(req.body.limit, 10);
  }
  if (req.body.offset) {
    params.offset = parseInt(req.body.offset, 10);
  }
  if (req.body.statusType) {
    params.statusType = req.body.statusType;
  }
  if (req.body.filters) {
    // todo
    if (typeof req.body.filters === 'string') {
      try {
        req.body.filters = JSON.parse(req.body.filters);
      } catch (e) {
        logger.error('auctions getList filters parse error: %j', e);
        delete req.body.filters;
      }
    }
    params.filters = req.body.filters;
  }

  const auctions = await getListV2(req.user, params);

  if (redisClient) {
    redisClient.setex(req.redisToken, 30, JSON.stringify({ status: 'success', auctions }));
  }
  return { status: 'success', auctions };
};
