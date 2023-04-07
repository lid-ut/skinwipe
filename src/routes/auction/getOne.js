const Comment = require('../../models/Comment');
const User = require('../../models/User');
const Auction = require('../../models/Auction');
const processItem = require('../../helpers/processItem');
const hasReviewed = require('../../helpers/hasReviewed');

const shortUserInfo = (user, friends) => {
  return {
    personaname: user.personaname,
    bans: user.bans,
    steamId: user.steamId,
    avatar: user.avatarfull,
    avatarmedium: user.avatarfull,
    subscriber: user.subscriber,
    reviews: user.reviews || {
      avg: 0,
      count: 0,
      hasReviewed: false,
    },
    allSkinsCount: user.allSkinsCount,
    tradeUrl: user.tradeUrl,
    isFriend: (friends || []).findIndex(stid => stid === user.steamId) !== -1,
  };
};

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

const fillV2 = async (auction, user) => {
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
    user: {
      personaname: auction.user.personaname,
      bans: auction.user.bans,
      steamId: auction.user.steamId,
      avatar: auction.user.avatarfull,
      avatarmedium: auction.user.avatarfull,
      subscriber: auction.user.subscriber,
      reviews: auction.user.reviews,
      allSkinsCount: auction.user.allSkinsCount,
      isFriend: (user.friends || []).findIndex(stid => stid === auction.steamId) !== -1,
    },

    allSkinsPrice: auction.allSkinsPrice,
    items: auction.items,

    message: !auction.user.chatBanned ? auction.message : '',
    premium: auction.premium || auction.user.subscriber,

    disableComments: !!auction.disableComments,
    games: auction.games || ['730', '570'],
    minSkinPrice: auction.minSkinPrice || 0,
    minBetPrice: auction.minBetPrice || 0,

    likes: (auction.likes || []).length,
    views: auction.views || 0,
    didILikeThis: !!(auction.likes || []).find(like => like === user.steamId),

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
        user: shortUserInfo(betUser, user.friends),
        trade,
      });
    });
    for (let j = 0; j < auctionItem.bets.length; j++) {
      const bItem = auctionItem.bets[j];
      bItem.trade.user1 = shortUserInfo(bItem.user);
      if (bItem.trade.user1 && bItem.trade.user1.reviews) {
        // eslint-disable-next-line no-await-in-loop
        bItem.trade.user1.reviews.hasReviewed = await hasReviewed(auctionItem.user.steamId, bItem.user.user);
      }
      bItem.trade.user2 = shortUserInfo(auctionItem.user);
      if (bItem.trade.user2 && bItem.trade.user2.reviews) {
        // eslint-disable-next-line no-await-in-loop
        bItem.trade.user2.reviews.hasReviewed = await hasReviewed(auctionItem.user.steamId, bItem.user.user);
      }
      const trade = bItem.trade;

      // eslint-disable-next-line no-await-in-loop
      trade.items = await Promise.all(trade.items.map(processItem));
      trade.items.sort(sortItemsByPrice);

      bItem.trade = {
        _id: trade._id,
        code: trade.code,
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

module.exports = async function process(req) {
  let auction = await Auction.findOne({ _id: req.params.auctionId }).populate('user bets.user').lean().exec();

  if (!auction) {
    return { status: 'error', code: 0, message: 'auction not found' };
  }

  auction = await fillV2(auction, req.user);

  if (redisClient) {
    redisClient.setex(req.redisToken, 30, JSON.stringify({ status: 'success', result: { auction } }));
  }
  return { status: 'success', result: { auction } };
};
