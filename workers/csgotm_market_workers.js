require('../logger');
const cron = require('node-cron');
const Sentry = require('@sentry/node');

const initSequelize = require('../src/modules/sequelize/init');

initSequelize(() => {
  console.log('postgres start');
});

require('../discord');
const config = require('../config');
const updateCSGOTMBalances = require('./background_workers/market/updateCSGOTMBalances');
const loadCSGOTMPrices = require('./background_workers/market/loadCSGOTMPrices');
const sellCSGOTMSkins = require('./background_workers/market/sellCSGOTMSkins');
const buyCSGOTMSkins = require('./background_workers/market/buyCSGOTMSkins');
const checkCSGOTMSkins = require('./background_workers/market/checkCSGOTMSkins');
const closeCSGOTMSkins = require('./background_workers/market/closeCSGOTMSkins');

logger.info('==========[csgotm market workers]==========');

if (config.sentry.enabled) {
  Sentry.init({ dsn: config.sentry.workers });
}

process.on('warning', e => console.error(e.stack));

const runChecks = {
  loadCSGOTMPrices: false,
  sellCSGOTMSkins: false,
  buyCSGOTMSkins: false,
  checkCSGOTMSkins: false,
  closeCSGOTMSkins: false,
  updateCSGOTMBalances: false,
};

cron.schedule('*/10 * * * * *', async () => {
  if (runChecks.updateCSGOTMBalances) {
    return;
  }
  runChecks.updateCSGOTMBalances = true;
  await updateCSGOTMBalances();
  runChecks.updateCSGOTMBalances = false;
});

cron.schedule('*/5 * * * * *', async () => {
  if (runChecks.checkCSGOTMSkins) {
    // logger.error('loadCSGOTMPrices is still running!');
    return;
  }
  runChecks.checkCSGOTMSkins = true;
  await checkCSGOTMSkins();
  runChecks.checkCSGOTMSkins = false;
});

cron.schedule('*/5 * * * * *', async () => {
  if (runChecks.closeCSGOTMSkins) {
    // logger.error('loadCSGOTMPrices is still running!');
    return;
  }
  runChecks.closeCSGOTMSkins = true;
  await closeCSGOTMSkins();
  runChecks.closeCSGOTMSkins = false;
});

cron.schedule('*/10 * * * * *', async () => {
  if (runChecks.buyCSGOTMSkins) {
    return;
  }
  runChecks.buyCSGOTMSkins = true;
  await buyCSGOTMSkins();
  runChecks.buyCSGOTMSkins = false;
});

cron.schedule('*/10 * * * * *', async () => {
  if (runChecks.loadCSGOTMPrices) {
    return;
  }
  runChecks.loadCSGOTMPrices = true;
  await loadCSGOTMPrices();
  runChecks.loadCSGOTMPrices = false;
});

cron.schedule('*/10 * * * * *', async () => {
  if (runChecks.sellCSGOTMSkins) {
    return;
  }
  runChecks.sellCSGOTMSkins = true;
  await sellCSGOTMSkins();
  runChecks.sellCSGOTMSkins = false;
});
