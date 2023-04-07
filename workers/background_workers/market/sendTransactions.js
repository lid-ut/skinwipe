const MarketTrade = require('../../../src/models/MarketTrade');
const Trade = require('../../../src/models/Trade');
const User = require('../../../src/models/User');
const getInfo = require('../../../src/modules/money/transaction/getInfo');
const sendLogs = require('../../../src/modules/discordlogs/send');

module.exports = async () => {
  const transactions = await Transactions.findAll({
    where: {
      // notif: { $ne: true },
      updatedAt: { $gte: new Date(Date.now() - 10 * 1000) },
    },
  });

  const aggregateUsersRes = await User.aggregate([
    { $match: { money: { $gt: 0 } } },
    {
      $group: {
        _id: null,
        sum: { $sum: '$money' },
      },
    },
  ]);

  // eslint-disable-next-line no-await-in-loop
  const aggregateUsersResLt = await User.aggregate([
    { $match: { money: { $lt: 0 } } },
    {
      $group: {
        _id: null,
        sum: { $sum: '$money' },
      },
    },
  ]);
  // eslint-disable-next-line no-restricted-syntax
  for (const transaction of transactions) {
    // transaction.notif = true;
    // eslint-disable-next-line no-await-in-loop
    // await MoneyTransactions.updateOne({ _id: transaction._id }, { $set: { notif: true } });

    const id = transaction.id;
    const count = transaction.amount;
    let tradeMarket = null;
    let tradeP2p = null;

    if (id.length === 24) {
      // eslint-disable-next-line no-await-in-loop
      tradeMarket = await MarketTrade.findOne({ _id: id }).lean();
      // eslint-disable-next-line no-await-in-loop
      tradeP2p = await Trade.findOne({ _id: id }).lean();
    }
    const trade = tradeMarket || tradeP2p;

    // eslint-disable-next-line no-await-in-loop
    const infoTr = getInfo(transaction, trade);

    // eslint-disable-next-line no-await-in-loop
    await sendLogs(
      `${Math.round(aggregateUsersRes[0] ? aggregateUsersRes[0].sum : 0) / 100}  ${
        Math.round(aggregateUsersResLt[0] ? aggregateUsersResLt[0].sum : 0) / 100
      } ${id} ${transaction.status}  $${Math.round(count) / 100} ${infoTr.type} ${infoTr.direction ? infoTr.direction : ''} ${
        trade && trade.virtual ? 'virtual' : ''
      }`,
    );
  }
};
