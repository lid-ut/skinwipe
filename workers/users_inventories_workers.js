require('../logger');
const cron = require('node-cron');
const Sentry = require('@sentry/node');

const updateUsersInventory = require('./background_workers/inventories/updateUsersInventory');
const sendStatsInventoryDiscord = require('./background_workers/inventories/sendStatsInventoryDiscord');
const retryUserInventory = require('./background_workers/inventories/retryUserInventory');
const deleteOldInventory = require('./background_workers/inventories/deleteOldInventory');
const addItemsToCommon = require('./background_workers/inventories/addItemsToCommon');

require('../discord');
const config = require('../config');
const getFloats = require('./background_workers/inventories/getFloats');

logger.info('==========[update user inventories worker started]==========');

if (config.sentry.enabled) {
  Sentry.init({ dsn: config.sentry.workers });
}

process.on('warning', e => console.error(e.stack));

const runChecks = {
  retryUserInventory: false,
  updateUserInventory: false,
  deleteOldInventory: false,
  getFloats: false,
};

cron.schedule('0 0 * * *', async () => {
  if (runChecks.retryUserInventory) {
    return;
  }
  runChecks.retryUserInventory = true;
  try {
    await retryUserInventory();
  } catch (e) {
    console.log(e.toString());
  }

  runChecks.retryUserInventory = false;
});

cron.schedule('*/10 * * * * *', async () => {
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

cron.schedule('0 * * * *', async () => {
  try {
    await sendStatsInventoryDiscord();
  } catch (e) {
    console.log(e.toString());
  }
});

// Every day
cron.schedule('15 0 * * *', async () => {
  if (runChecks.deleteOldInventory) {
    return;
  }
  runChecks.deleteOldInventory = true;
  try {
    await deleteOldInventory();
  } catch (e) {
    console.log(e.toString());
  }

  runChecks.deleteOldInventory = false;
});

cron.schedule('* * * * * *', async () => {
  if (runChecks.getFloats) {
    // logger.error('getFloats is still running!');
    return;
  }
  runChecks.getFloats = true;
  // try {
  await getFloats();
  // } catch (e) {
  //   console.log(e.toString());
  // }
  runChecks.getFloats = false;
});
