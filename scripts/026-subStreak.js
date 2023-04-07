require('../logger');
const User = require('../src/models/User');
const Purchase = require('../src/models/Purchase');

User.find({ subscriber: true, lastActiveDate: { $gte: Date.now() - 30 * 24 * 60 * 60 * 1000 } }).then(async users => {
  logger.info(`Users: ${users.length}`);
  const results = {};
  for (let i = 0; i < users.length; i++) {
    users[i].purchases = await Purchase.find({ steamId: users[i].steamId, success: true, 'data.productId': /premium/i });
    // logger.info(`[${users[i].steamId}] purchases: ${users[i].purchases.length}`);
    let startDate = 0;
    if (!users[i].purchases.length) {
      startDate = Date.now();
    }
    for (let j = 0; j < users[i].purchases.length; j++) {
      if (users[i].purchases[j].data.purchaseTime) {
        if (users[i].purchases[j].data.purchaseTime > startDate) {
          startDate = users[i].purchases[j].data.purchaseTime;
        }
      } else if (users[i].purchases[j].data.purchaseDateMs) {
        if (users[i].purchases[j].data.purchaseDateMs > startDate) {
          startDate = users[i].purchases[j].data.purchaseDateMs;
        }
      } else if (users[i].purchases[j].data[0].purchaseTime) {
        if (users[i].purchases[j].data[0].purchaseTime > startDate) {
          startDate = users[i].purchases[j].data[0].purchaseTime;
        }
      } else if (users[i].purchases[j].data[0].purchaseDateMs) {
        if (users[i].purchases[j].data[0].purchaseDateMs > startDate) {
          startDate = users[i].purchases[j].data[0].purchaseDateMs;
        }
      }
    }
    // console.log(startDate);
    const months = Math.floor((Date.now() - new Date(startDate).getTime()) / 1000 / 60 / 60 / 24 / 30);
    // console.log(`Months: ${months}`);
    if (months) {
      if (!results[months]) {
        results[months] = 0;
      }
      results[months]++;
    }
  }
  logger.info('Done!', results);
  process.exit(1);
});
