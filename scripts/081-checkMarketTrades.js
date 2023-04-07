require('../logger');
const User = require('../src/models/User');
const MoneyTransaction = require('../src/models/MoneyTransaction');
const MarketTrade = require('../src/models/MarketTrade');
const sumMoneyTransactions = require('../src/helpers/sumMoneyTransactions');

(async () => {
  const marketTrades = await MarketTrade.find({
    status: 'close',
  });

  for (const trade of marketTrades) {
    const moneyTranmsactions = await MoneyTransaction.find({ status: 'done', token: trade._id.toString() });
    if (moneyTranmsactions.length > 0) {
      console.log(`deleted for ${trade._id}`);
      await MoneyTransaction.updateMany({ status: 'done', token: trade._id.toString() }, {$set: {status: 'close'}});
      const buyer = await User.findOne({ steamId: trade.buyer });
      await sumMoneyTransactions(buyer);
      const seller = await User.findOne({ steamId: trade.seller });
      await sumMoneyTransactions(seller);
      return false;
    }
  }
})();
