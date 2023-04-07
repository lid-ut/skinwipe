require('../../logger');
const initSequelize = require('../../src/modules/sequelize/init');

const User = require('../../src/models/User');
const MoneyTransactions = require('../../src/models/MoneyTransaction');
const sumMoneyTransaction = require('../../src/helpers/sumMoneyTransactions');
const changeMoney = require('../../src/helpers/changeMoney');

const getOldBalance = async user => {
  const trans = await MoneyTransactions.find({ steamId: user.steamId, status: 'done' });

  let sum = 0;

  for (const tr of trans) {
    sum += tr.amount;
  }

  return sum;
};

initSequelize(() => {
  User.findOne({
    steamId: '76561199162898769',
  }).then(async user => {
    // const oldBalance = await getOldBalance(user);

    // console.log(oldBalance);
    // if (oldBalance > 0) {
    //   await changeMoney(user, 'restore_balance', 'in', 'done', 'restore', Math.round(oldBalance));
    // }
    await changeMoney(user, 'restore_admin', 'in', 'done', 'restore_admin', Math.round(1200));
    await sumMoneyTransaction(user);
  });
});
