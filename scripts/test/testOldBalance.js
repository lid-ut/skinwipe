require('../../logger');
const initSequelize = require('../../src/modules/sequelize/init');
const User = require('../../src/models/User');

const isPaidUser = async user => {
  const oldPayments = await Transactions.findAll({
    where: {
      steamId: user.steamId,
      status: 'done',

      createdAt: { [Op.lt]: new Date(2021, 11, 1) },
    },
  });

  const newPayments = await Transactions.findAll({
    where: {
      steamId: user.steamId,
      status: 'done',
      // createdAt: { [Op.gt]: new Date(2021, 11, 1) },
    },
  });

  let sumOld = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const pay of oldPayments) {
    sumOld += pay.amount;
  }

  let sumNew = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const pay of newPayments) {
    sumNew += pay.amount;
  }
  sumNew -= sumOld;

  return { res: sumNew > sumOld, sum: sumNew + sumOld };
};

initSequelize(async () => {
  console.log('server start');

  const users = await User.find({
    money: { $gte: 10 },
  });

  let countTrue = 0;
  let sumTrue = 0;
  let countFalse = 0;
  let sumFalse = 0;
  for (const user of users) {
    const res = await isPaidUser(user);
    if (res.res) {
      countTrue++;
      sumTrue += res.sum;
    } else {
      countFalse++;
      sumFalse += res.sum;
    }
  }

  console.log(`${countTrue} - ${Math.round(sumTrue) / 100}`);
  console.log(`${countFalse} - ${Math.round(sumFalse) / 100}`);
});
