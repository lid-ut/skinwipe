require('../logger');
const MoneyTransaction = require('../src/models/MoneyTransaction');
const Trade = require('../src/models/Trade');
const User = require('../src/models/User');
const sumMoneyTransactions = require('../src/helpers/sumMoneyTransactions');

(async () => {
  const steamIds = await Trade.distinct('steamId', { money: { $ne: null } });
  const tradesIds = await Trade.distinct('_id', { money: { $ne: null } });

  const users = await User.find({ steamId: { $in: steamIds } });

  await MoneyTransaction.deleteMany({ token: { $in: tradesIds } });

  for (const user of users) {
    await sumMoneyTransactions(user);
  }
  console.log('done');
})();
