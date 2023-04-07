require('../../logger');
const User = require('../../src/models/User');
const MoneyTransaction = require('../../src/models/MoneyTransaction');
const sumMoneyTransactions = require('../../src/helpers/sumMoneyTransactions');
const initSequelize = require('../../src/modules/sequelize/init');

const sumDoneMoneyTransactions = async user => {
  const transactions = await Transactions.findAll({
    where: {
      steamId: user.steamId,
      status: 'done',
    },
  });

  let sum = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const transaction of transactions) {
    sum += transaction.amount;
  }
  return sum;
};

const sumOldMoneyTransactions = async user => {
  const transactions = await MoneyTransaction.find({
    steamId: user.steamId,
    status: 'done',
  });

  let sum = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const transaction of transactions) {
    sum += transaction.amount;
  }
  return sum;
};

initSequelize(() => {
  User.find({ money: { $gt: 0 } })
    .cursor()
    .eachAsync(
      async user => {
        const money = user.money;

        let res = await sumMoneyTransactions(user);
        let res2 = await sumDoneMoneyTransactions(user);
        let res3 = await sumOldMoneyTransactions(user);
        if (money > res2) {
          console.log(`-> ${user.steamId} ${res} ${res2} ${res3} ${money}`);
        }
      },
      { parallel: 250 },
    )
    .then(() => {
      console.log('End');
    });
});
