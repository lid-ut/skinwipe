require('../logger');
const cron = require('node-cron');
const Sentry = require('@sentry/node');

const initSequelize = require('../src/modules/sequelize/init');

initSequelize(() => {
  console.log('postgres start');
});

require('../discord');
const config = require('../config');
const acceptTrades = require('./background_workers/market/acceptTrades');
const updateInventory = require('./background_workers/inventories/updateBotsInventory');
const sellBotSkins = require('./background_workers/market/sellBotSkins');
const resetInventory = require('./background_workers/market/bot/resetInventory');
const calculateBotsInventoryStatsToday = require('./background_workers/market/bot/calculateBotsInventoryStatsToday');

logger.info('==========[market bots workers started]==========');

if (config.sentry.enabled) {
  Sentry.init({ dsn: config.sentry.workers });
}

process.on('warning', e => console.error(e.stack));

const runChecks = {
  sellBotSkins: false,
  resetInventory: false,
  calculateBotsInventoryStatsToday: false,
  updateInventory: false,
  acceptTrades: false,
};

cron.schedule('*/20 * * * * *', async () => {
  if (runChecks.sellBotSkins) {
    return;
  }
  runChecks.sellBotSkins = true;
  try {
    await sellBotSkins();
  } catch (e) {
    console.log(e.toString());
  }
  runChecks.sellBotSkins = false;
});

cron.schedule('*/20 * * * * *', async () => {
  if (runChecks.acceptTrades) {
    return;
  }
  runChecks.acceptTrades = true;
  try {
    await acceptTrades();
  } catch (e) {
    console.log(e.toString());
  }
  runChecks.acceptTrades = false;
});

cron.schedule('*/5 * * * *', async () => {
  if (runChecks.resetInventory) {
    logger.error('resetInventory is still running!');
    return;
  }
  runChecks.resetInventory = true;
  // try {
  await resetInventory();
  // } catch (e) {
  //   console.log(e.toString());
  // }
  runChecks.resetInventory = false;
});

cron.schedule('1 * * * *', async () => {
  if (runChecks.calculateBotsInventoryStatsToday) {
    logger.error('calculateBotsInventoryStatsToday is still running!');
    return;
  }
  runChecks.calculateBotsInventoryStatsToday = true;
  // try {
  await calculateBotsInventoryStatsToday();
  // } catch (e) {
  //   console.log(e.toString());
  // }
  runChecks.calculateBotsInventoryStatsToday = false;
});

cron.schedule('0 * * * *', async () => {
  runChecks.updateInventory = false; // force restart;
});

cron.schedule('*/20 * * * * *', async () => {
  if (runChecks.updateInventory) {
    logger.error('updateInventory is still running!');
    return;
  }
  runChecks.updateInventory = true;
  try {
    await updateInventory();
  } catch (e) {
    console.log(e.toString());
  }
  runChecks.updateInventory = false;
});
