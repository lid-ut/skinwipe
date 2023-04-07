const UserNews = require('../../models/UserNews');
const Comment = require('../../models/Comment');
const AuctionController = require('../../controllers/AuctionController');
const logFinish = require('../../helpers/logFinish');
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

async function processTrade(trade) {
  trade.items = (trade.items || []).map(item => {
    return {
      ...item,
      appid: parseInt(item.appid, 10),
      rarity_color: (item.rarity_color || '').replace('#', ''),
    };
  });
  trade.itemsPartner = (trade.itemsPartner || []).map(item => {
    return {
      ...item,
      appid: parseInt(item.appid, 10),
    };
  });

  trade.items.sort(sortItemsByPrice);
  trade.itemsPartner.sort(sortItemsByPrice);

  if (!trade.user1) {
    trade.user1 = {
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

  trade.comments = await Comment.find({ entityType: 'trade', entityId: trade._id.toString() }).populate('user');
  trade.comments = trade.comments.map(com => {
    return {
      _id: com._id,
      date: com.createdAt,
      comment: com.comment,
      steamId: com.steamId,
      personaname: com.user.personaname,
      avatar: com.user.avatarfull,
      subscriber: com.user.subscriber,
    };
  });

  return {
    _id: trade._id,
    createdAt: trade.createdAt,
    timeAgo: Math.floor((Date.now() - new Date(trade.createdAt).getTime()) / 1000),
    steamId: trade.steamId,
    steamIdPartner: trade.steamIdPartner,
    autoTrade: !!trade.autoTrade,
    user: getShortUserInfo(trade.user1),
    partner: getShortUserInfo(trade.user2),
    items: await Promise.all((trade.items || []).map(item => processItem(item))),
    itemsPartner: await Promise.all((trade.itemsPartner || []).map(item => processItem(item))),
    likes: (trade.likes || []).length,
    didILikeThis: trade.didILikeThis,
    comments: trade.comments,
    myAllSkinsPrice: trade.myAllSkinsPrice,
    hisAllSkinsPrice: trade.hisAllSkinsPrice,
    premium: trade.premium,
    status: trade.status,
    isOpened: trade.isOpened,
    steamTradeStatus: trade.steamTradeStatus,
    steamTradeID: trade.steamTradeID,
    steamTradeComment: trade.steamTradeComment,
    datecteate: trade.datecreate,
  };
}

async function getTheWall(user, limit, offset) {
  const steamIds = [user.steamId].concat(user.friends || []);
  const query = { $and: [{ steamId: steamIds }, { steamId: { $nin: user.blacklist } }] };
  const count = await UserNews.countDocuments(query);
  const userNews = await UserNews.find(query)
    .populate('trade auction')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset || 0)
    .lean()
    .exec();

  await UserNews.populate(userNews, 'auction.user auction.bets.user trade.user1 trade.user2');

  const news = [];
  for (let i = 0; i < userNews.length; i++) {
    const n = userNews[i];
    if (n.type === 'auction') {
      // eslint-disable-next-line no-await-in-loop
      const auction = await AuctionController.fillV2(n.auction, user.steamId);
      news.push({
        type: 'auction',
        date: auction.createdAt,
        auction,
      });
      // eslint-disable-next-line no-continue
      continue;
    }

    // type: 'trade'
    if (!n.trade) {
      // eslint-disable-next-line no-await-in-loop
      await UserNews.deleteOne({ _id: n._id });
    } else {
      // eslint-disable-next-line no-await-in-loop
      const trade = await processTrade(n.trade);
      trade.didILikeThis = !!(n.trade.likes || []).find(like => like === user.steamId);
      news.push({
        type: n.trade.autoTrade ? 'autoTrade' : 'trade',
        date: n.trade.createdAt,
        trade,
      });
    }
  }
  return {
    count,
    news,
  };
}

module.exports = async function process(req, res) {
  // eslint-disable-next-line no-undef
  if (redisClient && redisGet) {
    // eslint-disable-next-line no-undef
    const result = await redisGet(req.redisToken);
    if (result) {
      res.json(result);
      return;
    }
  }
  const result = await getTheWall(req.user, parseInt(req.params.limit || 20, 10), parseInt(req.params.offset || 0, 10));

  if (redisClient) {
    redisClient.setex(req.redisToken, 60, JSON.stringify({ status: 'success', result }));
  }
  res.json({ status: 'success', result });
};
