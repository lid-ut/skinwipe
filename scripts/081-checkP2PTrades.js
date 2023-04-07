require('../logger');
const User = require('../src/models/User');
const MoneyTransaction = require('../src/models/MoneyTransaction');
const Trade = require('../src/models/Trade');
const sumMoneyTransactions = require('../src/helpers/sumMoneyTransactions');

(async () => {
  const trades = await Trade.find({
    status: 'reject',
    // autoTrade: true,
    money: { $gt: 0 },
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });

  for (const trade of trades) {
    const moneyTranmsactions = await MoneyTransaction.find({ status: 'done', token: trade._id.toString() });
    if (moneyTranmsactions.length > 0) {
      console.log(`deleted for ${trade._id}`);
      await MoneyTransaction.deleteMany({ status: 'done', token: trade._id.toString() });
      const buyer = await User.findOne({ steamId: trade.buyer });
      await sumMoneyTransactions(buyer);
      const seller = await User.findOne({ steamId: trade.seller });
      await sumMoneyTransactions(seller);
    }
  }
})();
