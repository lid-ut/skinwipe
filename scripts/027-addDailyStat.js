require('../logger');
const addPaidStat = require('../src/helpers/addPaidStat');

(async function run() {
  await addPaidStat('premiumAuction', 10);
  // await addPaidStat('paidAuction', 10);
  // await addPaidStat('upAuction', 10);
  // await addPaidStat('upUser', 10);
  // await addPaidStat('paidSuperTrades', 10);
  // await addPaidStat('premiumSuperTrades', 10);
  // await addPaidStat('paidDiffsSupertrade', 10);

  logger.info('Done!');
  process.exit(1);
})();
