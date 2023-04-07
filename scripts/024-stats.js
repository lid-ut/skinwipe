require('../logger');
const User = require('../src/models/User');
const Message = require('../src/models/Message');
const Room = require('../src/models/Room');
const Trade = require('../src/models/Trade');
const Auction = require('../src/models/Auction');
const Transaction = require('../src/models/Transaction');
const TodayUsersStat = require('../src/models/TodayUsersStat');

async function runDay(d) {
  const startDate = new Date(d);
  startDate.setUTCHours(0, 0);
  const endDate = new Date(d);
  endDate.setUTCHours(24, 0);

  const date = `${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()}`;
  const Stat = (await TodayUsersStat.findOne({ date })) || new TodayUsersStat();

  Stat.codesEntered = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    invitationCode: { $ne: null },
  });

  Stat.messages = await Message.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
  Stat.tradeMessages = await Message.countDocuments({ createdAt: { $gte: startDate, $lte: endDate }, type: 'trade' });
  Stat.rooms = await Room.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
  Stat.messageWriters = (await Message.distinct('steamId', { createdAt: { $gte: startDate, $lte: endDate } })).length;

  // Надо юзать purchases
  // Stat.subsActive = await User.countDocuments({ subscriber: true });
  // subsNew
  // subsDeclined

  Stat.superTradesCreated = await Trade.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    autoTrade: true,
  });

  Stat.tradesCreated = await Trade.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    autoTrade: { $ne: true },
  });
  Stat.tradesCreators = (await Trade.distinct('steamId', { createdAt: { $gte: startDate, $lte: endDate } })).length;
  Stat.tradesDeclined = await Trade.countDocuments({ updatedAt: { $gte: startDate, $lte: endDate }, status: 'reject' });
  Stat.tradesAccepted = await Trade.countDocuments({
    updatedAt: { $gte: startDate, $lte: endDate },
    status: { $in: ['finished', 'accepted'] },
  });

  Stat.auctionsCreated = await Auction.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
  Stat.auctionsCreators = (await Auction.distinct('steamId', { createdAt: { $gte: startDate, $lte: endDate } })).length;
  Stat.auctionsClosed = await Auction.countDocuments({
    status: 'close',
    autoClose: { $ne: null },
    updatedAt: { $gte: startDate, $lte: endDate },
  });
  Stat.auctionsAccepted = await Auction.countDocuments({
    $or: [
      { status: 'processed' },
      {
        status: 'close',
        autoClose: null,
      },
    ],
    updatedAt: { $gte: startDate, $lte: endDate },
  });

  Stat.regs = await User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
  Stat.regsTrade = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    'stats.createdTrades': { $gt: 0 },
  });
  Stat.regsSuperTrade = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    'stats.createdAutoTrades': { $gt: 0 },
  });
  Stat.regsAuction = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
    'stats.createdAuctions': { $gt: 0 },
  });

  console.log('regsAuction:', Stat.date, Stat.regsAuction);

  Stat.advertTransactions = await Transaction.countDocuments({ createdAt: { $gte: startDate, $lte: endDate }, token: 'advertisement' });
  Stat.advertUsers = (
    await Transaction.distinct('user_steam_id', { createdAt: { $gte: startDate, $lte: endDate }, token: 'advertisement' })
  ).length;

  await Stat.save();
}

async function run() {
  for (let i = 1; i < 30; i++) {
    await runDay(Date.now() - i * 24 * 60 * 60 * 1000);
  }

  logger.info('Done!');
  process.exit(1);
}

run();
