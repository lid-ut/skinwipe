const User = require('../models/User');
// const sendPushV3 = require('./sendPushV3');

module.exports = async function sumMoneyTransactions(user) {
  if (!user) {
    return 0;
  }

  const transactions = await Transactions.findAll({
    where: {
      steamId: user.steamId,
      [Op.or]: [{ status: 'done' }, { status: 'wait', amount: { [Op.lt]: 0 } }],
    },
  });

  let sum = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const transaction of transactions) {
    sum += transaction.amount;
  }

  await User.updateOne(
    { steamId: user.steamId },
    {
      $set: {
        money: sum,
      },
    },
  );

  // await sendPushV3(user, { type: 'UPDATE_MONEY_BALANCE' });
  return sum;
};
