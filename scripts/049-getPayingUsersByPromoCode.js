require('../logger');
const User = require('../src/models/User');
const Purchase = require('../src/models/Purchase');
const KassaInvoice = require('../src/models/KassaInvoice');

User.find({
  specialCodes: {
    $in: [
      'kensi',
      'prepodsteam',
      'csgotrend',
      'trendskin',
      'prepod',
      'kamen',
      'kuskin',
      'belyar',
      'floppy',
      'gaymercsgo',
      'flaxxskin',
      'ramzikgg',
    ],
  },
  createdAt: { $gt: new Date('2020-12-01 00:00:00.000Z'), $lt: new Date('2021-01-11 00:00:00.000Z') },
}).then(async users => {
  console.log(`${users.length}`);

  let countPrem = 0;
  let countPrem3m = 0;
  let countPrem6m = 0;
  let countPrem12m = 0;
  let countMoney = 0;

  for (let i = 0; i < users.length; i++) {
    // console.log(`${i} of ${users.length}`);
    // console.log(users[i].tradeUrl.replace(/"/g, ''));
    countPrem += await Purchase.countDocuments({ success: true, steamId: users[i].steamId, 'data.productId': /premium/i });
    countPrem3m += await Purchase.countDocuments({ success: true, steamId: users[i].steamId, 'data.productId': /premium3m/i });
    countPrem6m += await Purchase.countDocuments({ success: true, steamId: users[i].steamId, 'data.productId': /premium6m/i });
    countPrem12m += await Purchase.countDocuments({ success: true, steamId: users[i].steamId, 'data.productId': /premium12m/i });
    countMoney += await Purchase.countDocuments({ success: true, steamId: users[i].steamId, 'data.productId': /coins/i });
    countPrem += await KassaInvoice.countDocuments({ status: 'succeeded', productCount: 1, steamId: users[i].steamId });
    countPrem3m += await KassaInvoice.countDocuments({ status: 'succeeded', productCount: 3, steamId: users[i].steamId });
    countPrem6m += await KassaInvoice.countDocuments({ status: 'succeeded', productCount: 6, steamId: users[i].steamId });
    countPrem12m += await KassaInvoice.countDocuments({ status: 'succeeded', productCount: 12, steamId: users[i].steamId });
  }

  console.log(`countPrem = ${countPrem}`);
  console.log(`countPrem3m = ${countPrem3m}`);
  console.log(`countPrem6m = ${countPrem6m}`);
  console.log(`countPrem12m = ${countPrem12m}`);
  console.log(`countMoney = ${countMoney}`);

  logger.info('Done!');
  process.exit(1);
});
