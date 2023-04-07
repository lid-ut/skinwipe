require('../logger');
const User = require('../src/models/User');
const MoneyTransaction = require('../src/models/MoneyTransaction');

(async () => {
  let users = await User.find(
    {
      createdAt: {
        $gte: new Date(2021, 4, 21),
        $lte: new Date(2021, 4, 28),
      },
    },
    {
      steamId: 1,
    },
  ).lean();

  console.log('users');

  let i = 0;
  for (const user of users) {
    user.transactions = await MoneyTransaction.countDocuments({
      steamId: user.steamId,
      token: { $ne: null },
      status: 'close',
      createdAt: {
        $gte: new Date(2021, 4, 21),
        $lte: new Date(2021, 4, 28),
      },
    });
    console.log(`${i} of ${users.length}`);
    i++;

    // users.transactions = transactions.filter(it => it.steamId === user.steamId).length;
  }
  console.log('add transactions');

  users.sort((a, b) => {
    if (a.transactions > b.transactions) {
      return 1;
    }
    if (a.transactions < b.transactions) {
      return -1;
    }
    return 0;
  });
  console.log('sort');

  for (let stat of users) {
    console.log(`${stat.steamId} - ${stat.transactions}`);
  }
})();
