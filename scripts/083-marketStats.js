require('../logger');
const User = require('../src/models/User');
const MarketTrade = require('../src/models/MarketTrade');
const MoneyTransaction = require('../src/models/MoneyTransaction');

(async () => {
  const users = await User.find({ invitationCode: 'krka5da9' });

  console.log(users.length);
  const trades = await MarketTrade.find({
    status: 'done',
    $or: [{ seller: { $in: users.map(it => it.steamId) } }, { buyer: { $in: users.map(it => it.steamId) } }],
  });
  let sumTrade = 0;
  let countTrade = 0;
  for (const trade of trades) {
    countTrade++;
    for (const item of trade.items) {
      sumTrade += item.price.steam.mean;
    }
    for (const item of trade.itemsPartner) {
      sumTrade += item.price.steam.mean;
    }
  }
  console.log(`${sumTrade} ${countTrade}`);

  const transactions = await MoneyTransaction.find({
    token: 'balance add',
    status: 'done',
    steamId: { $in: users.map(it => it.steamId) },
  });
  let sum = 0;
  let count = 0;
  for (const tr of transactions) {
    count++;
    sum += tr.amount;
  }
  console.log(`${count} ${sum}`);

  console.log('done');
})();
