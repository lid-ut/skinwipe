require('../../../logger');
const initSequelize = require('../../../src/modules/sequelize/init');

const User = require('../../../src/models/User');
const KassaInvoice = require('../../../src/models/KassaInvoice');

const isPaidUser = async user => {
  // eslint-disable-next-line no-undef
  const newPayments = await Transactions.findAll({
    where: {
      steamId: user.steamId,
      status: 'done',
      // eslint-disable-next-line no-undef
      [Op.or]: [{ type: 'ykassa_add' }, { type: 'sell_market_bot' }],
      // eslint-disable-next-line no-undef
      createdAt: { [Op.gt]: new Date(2021, 11, 1) },
    },
  });

  return newPayments.length > 0;
};

initSequelize(async () => {
  const users = await User.find(
    {
      money: { $gte: 0 },
    },
    { steamId: 1, money: 1 },
  );

  let count = 0,
    sum = 0;

  for (const user of users) {
    if (await isPaidUser(user)) {
      count++;
      sum += Math.round(user.money);

      console.log(count);
      console.log(sum);
    }
  }

  console.log(count);
  console.log(sum);
});
