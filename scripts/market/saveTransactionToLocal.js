require('../../logger');
const initSequelize = require('../../src/modules/sequelize/init');

// const User = require('../../src/models/User');
const MoneyTransaction = require('../../src/models/MoneyTransaction');
const User = require('../../src/models/User');
const changeMoney = require('../../src/helpers/changeMoney');
const sumMoneyTransactions = require('../../src/helpers/sumMoneyTransactions');

initSequelize(() => {
  User.find({
    subscriber: true,
  })
    .lean()
    .then(async users => {
      for (const user of users) {
        MoneyTransaction.find({ steamId: user.steamId, status: 'done' })
          .lean()
          .then(async transactions => {
            let sum = 0;
            for (const transaction of transactions) {
              sum += transaction.amount;
            }
            console.log(sum);

            if (sum > 0) {
              let haveTransaction = await Transactions.findOne({ where: { steamId: user.steamId, type: 'restore_balance' } });
              if (!haveTransaction) {
                await changeMoney(user, 'restore_balance', 'in', 'done', 'restore', Math.round(sum));
                await sumMoneyTransactions(user);
              }
            }
          });
      }
    });
});
