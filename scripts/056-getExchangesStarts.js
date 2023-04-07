function log(msg) {
  console.log(msg);
}

global.logger = { log, info: log };

const Auction = require('../src/models/Auction');
const Trade = require('../src/models/Trade');

(async () => {
  console.log('start');
  const startDate = new Date('2020-09-01 00:00:00.000Z');
  const endDate = new Date('2020-10-01 00:00:00.000Z');

  let tradesAggregate = await Trade.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        tradesIn: { $sum: '$myAllSkinsPrice' },
        tradesOut: { $sum: '$hisAllSkinsPrice' },
      },
    },
  ]);
  //
  let auctionsAggregate = await Auction.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $unwind: '$bets' },
    {
      $group: {
        _id: null,
        auctionsPrice: { $sum: '$allSkinsPrice' },
        betsPrice: { $sum: '$bets.tradeObject.myAllSkinsPrice' },
      },
    },
  ]);

  let betssAggregate = await Auction.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $unwind: '$bets' },
    { $group: { _id: '$_id', sum: { $sum: 1 } } },
    { $group: { _id: null, total_sum: { $sum: '$sum' } } },
  ]);

  tradesAggregate = tradesAggregate[0];
  auctionsAggregate = auctionsAggregate[0];

  console.log(
    `count - ${
      tradesAggregate.count +
      betssAggregate[0].total_sum +
      (await Auction.countDocuments({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      }))
    }`,
  );

  console.log(`tradesIn - ${tradesAggregate.tradesIn / 100}$`);
  console.log(`tradesOut - ${tradesAggregate.tradesOut / 100}$`);

  console.log(`auctionsPrice - ${auctionsAggregate.auctionsPrice / 100}$`);
  console.log(`betsPrice - ${auctionsAggregate.betsPrice / 100}$`);

  console.log(
    `all  - ${
      (tradesAggregate.tradesIn + tradesAggregate.tradesOut + auctionsAggregate.auctionsPrice + auctionsAggregate.betsPrice) / 100
    }$`,
  );
})();
