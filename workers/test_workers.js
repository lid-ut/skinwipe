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
const closeOldTrades = require('./background_workers/p2ptrades/closeOldTrades');
const p2pTradesFindSteamTradeId = require('./background_workers/p2ptrades/findSteamTradeId');
const p2pCheckTrades = require('./background_workers/p2ptrades/checkTrades');
const marketClear = require('./background_workers/market/clear');
const updateUsersInventory = require('./background_workers/inventories/updateUsersInventory');

logger.info('==========[market check trades worker started]==========');

if (config.sentry.enabled) {
  Sentry.init({ dsn: config.sentry.workers });
}

process.on('warning', e => console.error(e.stack));

const runChecks = {
  loadCSGOTMPrices: false,
  sellCSGOTMSkins: false,
  buyCSGOTMSkins: false,
  checkCSGOTMSkins: false,
  updateCSGOTMBalances: false,
  closeOldTrades: false,
  p2pTradesFindSteamTradeId: false,
  marketClear: false,
};

cron.schedule('*/5 * * * * *', async () => {
  // if (!config.production) {
  //   return;
  // }
  if (runChecks.updateUserInventory) {
    return;
  }
  runChecks.updateUserInventory = true;
  try {
    await updateUsersInventory();
  } catch (e) {
    console.log(e.toString());
  }

  runChecks.updateUserInventory = false;
});
