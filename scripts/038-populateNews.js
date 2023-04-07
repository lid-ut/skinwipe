require('../logger');
const Trade = require('../src/models/Trade');
const Auction = require('../src/models/Auction');
const UserNews = require('../src/models/UserNews');

const month = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
Trade.find(
  {
    createdAt: { $gte: month },
    // steamId: '76561198325134414',
  },
  {
    _id: 1,
    steamId: 1,
    createdAt: 1,
  },
).then(async trades => {
  const saveStartTime = Date.now();

  for (let i = 0; i < trades.length; i++) {
    const trade = trades[i];
    const percent = (i * 100) / trades.length;
    logger.info(`[trade][${Math.round(percent)}%][${i} / ${trades.length}] ${trade.steamId} in ${Date.now() - saveStartTime} ms`);
    if (!(await UserNews.findOne({ trade: trade._id }))) {
      await UserNews.create(trade.steamId, 'trade', trade);
    }
  }

  const auctions = await Auction.find(
    {
      createdAt: { $gte: month },
      // steamId: '76561198325134414',
    },
    {
      _id: 1,
      steamId: 1,
    },
  );
  for (let i = 0; i < auctions.length; i++) {
    const auction = auctions[i];
    const percent = (i * 100) / auctions.length;
    logger.info(`[auction][${Math.round(percent)}%][${i} / ${auctions.length}] ${auction.steamId} in ${Date.now() - saveStartTime} ms`);
    if (!(await UserNews.findOne({ auction: auction._id }))) {
      await UserNews.create(auction.steamId, 'auction', auction);
    }
  }
  logger.info('Done!');
  process.exit(1);
});
