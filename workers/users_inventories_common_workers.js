require('../logger');
const cron = require('node-cron');
const Sentry = require('@sentry/node');

const addItemsToCommon = require('./background_workers/inventories/addItemsToCommon');

require('../discord');
const config = require('../config');

logger.info('==========[update user inventories worker started]==========');

if (config.sentry.enabled) {
  Sentry.init({ dsn: config.sentry.workers });
}

process.on('warning', e => console.error(e.stack));

const runChecks = {
  addItemsToCommon: false,
};

cron.schedule('* * * * *', async () => {
  // if (!config.production) {
  //   return;
  // }
  if (runChecks.addItemsToCommon) {
    return;
  }
  runChecks.addItemsToCommon = true;
  try {
    await addItemsToCommon();
  } catch (e) {
    console.log(e.toString());
  }

  runChecks.addItemsToCommon = false;
});
