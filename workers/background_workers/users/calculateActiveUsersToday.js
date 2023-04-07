const User = require('../../../src/models/User');
const Message = require('../../../src/models/Message');
const Room = require('../../../src/models/Room');
const Trade = require('../../../src/models/Trade');
const Auction = require('../../../src/models/Auction');
const Transaction = require('../../../src/models/Transaction');
const TodayUsersStat = require('../../../src/models/TodayUsersStat');

module.exports = async () => {
  logger.info('[calculateActiveUsersToday] started');

  // Get users count where lastActiveDate more than today's day start
  // Create new record in todayUsersStat
  const startDate = new Date();
  startDate.setHours(0);
  startDate.setMinutes(0);
  const date = `${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()}`;
  const Stat = (await TodayUsersStat.findOne({ date })) || new TodayUsersStat();

  const usersCount = await User.countDocuments({ lastActiveDate: { $gt: startDate } });
  const monthStartDate = new Date();
  monthStartDate.setDate(1);
  monthStartDate.setHours(0);
  monthStartDate.setMinutes(0);
  const monthUsersCount = await User.countDocuments({ lastActiveDate: { $gt: monthStartDate } });
  const mobileUsersCount = await User.countDocuments({ mobileActiveDates: date });
  const webUsersCount = await User.countDocuments({ webActiveDates: date });

  Stat.date = date;
  Stat.activeUsers = usersCount || 0;
  Stat.monthlyActiveUsers = monthUsersCount || 0;
  Stat.mobileActiveUsers = mobileUsersCount || 0;
  Stat.webActiveUsers = webUsersCount || 0;

  Stat.skinSwipeNicknameUsers = await User.countDocuments({ personaname: /skinswipe/i });

  Stat.codesEntered = await User.countDocuments({ createdAt: { $gte: startDate }, invitationCode: { $ne: null } });
  Stat.coinsCount = (await User.aggregate([{ $group: { _id: '', cc: { $sum: '$coinCount' } } }]))[0].cc;

  Stat.messages = await Message.countDocuments({ createdAt: { $gte: startDate } });
  Stat.tradeMessages = await Message.countDocuments({ createdAt: { $gte: startDate }, type: 'trade' });
  Stat.rooms = await Room.countDocuments({ createdAt: { $gte: startDate } });
  Stat.messageWriters = (await Message.distinct('steamId', { createdAt: { $gte: startDate } })).length;

  Stat.superTradesCreated = await Trade.countDocuments({ createdAt: { $gte: startDate }, autoTrade: true });

  Stat.tradesCreated = await Trade.countDocuments({ createdAt: { $gte: startDate }, autoTrade: { $ne: true } });
  Stat.tradesCreators = (
    await Trade.distinct('steamId', {
      autoTrade: { $ne: true },
      createdAt: { $gte: startDate },
    })
  ).length;

  Stat.auctionsCreated = await Auction.countDocuments({ createdAt: { $gte: startDate } });
  Stat.auctionsCreators = (await Auction.distinct('steamId', { createdAt: { $gte: startDate } })).length;
  Stat.auctionsClosed = await Auction.countDocuments({
    status: 'close',
    autoClose: { $ne: null },
    updatedAt: { $gte: startDate },
  });
  Stat.auctionsAccepted = await Auction.countDocuments({
    $or: [
      { status: 'processed' },
      {
        status: 'close',
        autoClose: null,
      },
    ],
    updatedAt: { $gte: startDate },
  });

  Stat.regs = await User.countDocuments({ createdAt: { $gte: startDate } });
  Stat.regsTrade = await User.countDocuments({ createdAt: { $gte: startDate }, 'stats.createdTrades': { $gt: 0 } });
  Stat.regsSuperTrade = await User.countDocuments({
    createdAt: { $gte: startDate },
    'stats.createdAutoTrades': { $gt: 0 },
  });
  Stat.regsAuction = await User.countDocuments({ createdAt: { $gte: startDate }, 'stats.createdAuctions': { $gt: 0 } });
  Stat.supportCreated = Stat.supportCreated || 0;
  Stat.supportClosed = Stat.supportClosed || 0;

  Stat.advertTransactions = await Transaction.countDocuments({ createdAt: { $gte: startDate }, token: 'advertisement' });
  Stat.advertUsers = (await Transaction.distinct('user_steam_id', { createdAt: { $gte: startDate }, token: 'advertisement' })).length;

  await Stat.save();
  logger.info('[calculateActiveUsersToday] count', usersCount);

  const assets = await TodayUsersStat.aggregate([
    { $sort: { _id: 1 } },
    {
      $group: {
        _id: { aid: '$date' },
        aid: { $last: '$date' },
        ids: { $addToSet: '$_id' },
        sum: { $sum: 1 },
      },
    },
    {
      $match: { sum: { $gt: 1 } },
    },
  ]);

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    logger.info(`[${i + 1}/${assets.length}] asset: ${asset.aid} ${asset.sum}`);
    asset.ids.shift();
    // eslint-disable-next-line no-await-in-loop
    await TodayUsersStat.deleteMany({ _id: { $in: asset.ids } });
  }
};
