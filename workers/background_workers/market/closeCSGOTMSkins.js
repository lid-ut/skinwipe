const MarketTrade = require('../../../src/models/MarketTrade');
const changeTransaction = require('../../../src/modules/money/transaction/change');

module.exports = async () => {
  const marketTrades = await MarketTrade.find({
    type: 'csgotm',
    status: 'new',
    steamTradeId: null,
    createdAt: { $lte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const trade of marketTrades) {
    // eslint-disable-next-line no-await-in-loop
    await changeTransaction(trade._id, 'close');

    // eslint-disable-next-line no-await-in-loop
    await MarketTrade.updateMany({ _id: trade._id }, { $set: { status: 'close' } });
  }
};
