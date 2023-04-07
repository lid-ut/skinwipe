require('../logger');

const MoneyTransaction = require('../src/models/MoneyTransaction');
const MarketTrade = require('../src/models/MarketTrade');
const Trade = require('../src/models/Trade');

const sortItemsByPrice = (a, b) => {
  if (a.amount < b.amount) {
    return -1;
  }
  if (a.amount > b.amount) {
    return 1;
  }
  return 0;
};

(async () => {
  const transactions = await MoneyTransaction.find({
    status: 'done',
    createdAt: { $gte: new Date(2021, 7, 3) },
  });

  let trp = [];

  let sum = 0;
  for (const transaction of transactions) {
    if (transaction.token.indexOf('balance add') === -1) {
      continue;
    }

    let trade = null;

    try {
      trade = (await MarketTrade.findOne({ _id: transaction.token })) || (await Trade.findOne({ _id: transaction.token }));
    } catch (e) {}

    if (transaction.token.indexOf('balance add') !== -1) {
      sum += transaction.amount;
    }
    if (!trade) {
      trp.push(transaction);
    }
  }

  trp = trp.sort(sortItemsByPrice);

  for (const tr of trp) {
    console.log(`${tr._id} ${tr.amount} ${tr.token}`);
  }

  console.log(sum);
})();
