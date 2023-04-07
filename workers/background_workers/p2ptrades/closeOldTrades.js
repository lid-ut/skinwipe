const Trades = require('../../../src/models/Trade.js');
const changeTransaction = require('../../../src/modules/money/transaction/change');
const Trade = require('../../../src/models/Trade');

module.exports = async () => {
  console.log('start');
  const closeAll = new Date(Date.now() - 150 * 24 * 60 * 60 * 1000);

  const deadTimeAccepted = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const deadTimeNew = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const trades = await Trades.find({
    createdAt: { $gte: closeAll },
    status: { $nin: ['close', 'done'] },
    $or: [
      {
        status: 'accepted',
        createdAt: { $lte: deadTimeAccepted },
      },
      {
        status: 'new',
        createdAt: { $lte: deadTimeNew },
      },
    ],
  }).limit(500);
  console.log(trades.length);
  // eslint-disable-next-line no-restricted-syntax
  for (const trade of trades) {
    // eslint-disable-next-line no-await-in-loop
    await Trade.updateOne(
      { _id: trade._id },
      {
        $set: {
          closeReason: 'old',
          status: 'reject',
          steamTradeStatus: 'close',
        },
      },
    );
    if (trade.money > 0) {
      // eslint-disable-next-line no-await-in-loop
      await changeTransaction(trade._id, 'close');
    }
  }
};
