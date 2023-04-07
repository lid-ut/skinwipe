require('../../../logger');

const User = require('../../../src/models/User');

(async () => {
  console.log('start');
  const inv = await User.countDocuments({ allSkinsPrice: 0 });
  const inv0 = await User.countDocuments({ allSkinsPrice: { $gt: 0, $lt: 100 } });
  const inv1 = await User.countDocuments({ allSkinsPrice: { $gt: 100, $lte: 500 } });
  const inv2 = await User.countDocuments({ allSkinsPrice: { $gt: 500, $lte: 1000 } });
  const inv3 = await User.countDocuments({ allSkinsPrice: { $gt: 1000, $lte: 2500 } });
  const inv4 = await User.countDocuments({ allSkinsPrice: { $gt: 2500, $lte: 5000 } });
  const inv5 = await User.countDocuments({ allSkinsPrice: { $gt: 5000, $lte: 10000 } });
  const inv6 = await User.countDocuments({ allSkinsPrice: { $gt: 10000, $lte: 25000 } });
  const inv7 = await User.countDocuments({ allSkinsPrice: { $gt: 25000, $lte: 50000 } });
  const inv8 = await User.countDocuments({ allSkinsPrice: { $gt: 50000 } });

  console.log(`
0$ - ${inv}
До 1$ - ${inv0}
1-5$ - ${inv1}
5-10$ - ${inv2}
10-25$ - ${inv3}
25-50$ - ${inv4}
50-100$ - ${inv5}
100-250$ - ${inv6}
250-500$ - ${inv7}
500$+ - ${inv8}
  `);

  const money = await User.countDocuments({ money: 0 });
  const money0 = await User.countDocuments({ money: { $gt: 0, $lt: 100 } });
  const money1 = await User.countDocuments({ money: { $gt: 100, $lte: 500 } });
  const money2 = await User.countDocuments({ money: { $gt: 500, $lte: 1000 } });
  const money3 = await User.countDocuments({ money: { $gt: 1000, $lte: 2500 } });
  const money4 = await User.countDocuments({ money: { $gt: 2500, $lte: 5000 } });
  const money5 = await User.countDocuments({ money: { $gt: 5000, $lte: 10000 } });
  const money6 = await User.countDocuments({ money: { $gt: 10000, $lte: 25000 } });
  const money7 = await User.countDocuments({ money: { $gt: 25000, $lte: 50000 } });
  const money8 = await User.countDocuments({ money: { $gt: 50000 } });

  console.log(`
0$ - ${money}
До 1$ - ${money0}
1-5$ - ${money1}
5-10$ - ${money2}
10-25$ - ${money3}
25-50$ - ${money4}
50-100$ - ${money5}
100-250$ - ${money6}
250-500$ - ${money7}
500$+ - ${money8}
  `);
})();
