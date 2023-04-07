const User = require('../../models/User');
const UserController = require('../../controllers/UserController');

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
  const partner = await User.findOne({ steamId: req.params.steamId });
  if (!partner) {
    res.json({ status: 'error', message: 'partner not found' });
    return;
  }
  let online = 0; // offline
  if (partner.lastActiveDate > new Date(Date.now() - 10 * 60 * 1000)) {
    online = 1; // online
  } else if (partner.lastActiveDate > new Date(Date.now() - 60 * 60 * 1000)) {
    online = 2; // idle
  }

  const rating =
    (partner.stats || {}).createdTrades +
    (partner.stats || {}).finishedTrades * 5 +
    (partner.stats || {}).createdAutoTrades +
    (partner.stats || {}).finishedAutoTrades * 5 +
    (partner.stats || {}).createdAuctions +
    (partner.stats || {}).finishedAuctions * 5;

  if (!partner.stats || typeof partner.stats.gotTrades === 'undefined') {
    partner.stats = await UserController.getTraderInfo(req.user);
  }

  const profile = {
    steamId: partner.steamId,
    allSkinsCount: partner.allSkinsCount,
    personaname: partner.personaname,
    statusMessage: partner.subscriber && !partner.chatBanned ? partner.statusMessage || '' : '',
    avatar: partner.avatarfull,
    profileurl: partner.profileurl || '',
    online,
    rating,
    reviews: partner.reviews || {
      avg: 0,
      count: 0,
      hasReviewed: false,
    },
    stats: partner.stats,
    isFriend: !!(req.user.friends || []).find(fr => fr === partner.steamId),
    friendsCount: (partner.friends || []).length,
    commonFriendsCount: (partner.friends || []).filter(fr => (req.user.friends || []).indexOf(fr) > -1).length,
    subscriber: partner.subscriber,
    createdTrades: (partner.stats || {}).createdTrades,
    finishedTrades: (partner.stats || {}).finishedTrades,
    createdAutoTrades: (partner.stats || {}).createdAutoTrades,
    finishedAutoTrades: (partner.stats || {}).finishedAutoTrades,
    createdAuctions: (partner.stats || {}).createdAuctions,
    finishedAuctions: (partner.stats || {}).finishedAuctions,
    blackListed: (req.user.blacklist || []).indexOf(partner.steamId) > -1,
    heBlackListedMe: (partner.blacklist || []).indexOf(req.user.steamId) > -1,
    constraint: partner.constraint,
  };

  if (redisClient) {
    redisClient.setex(req.redisToken, 30, JSON.stringify({ status: 'success', profile }));
  }
  res.json({ status: 'success', profile });
};
