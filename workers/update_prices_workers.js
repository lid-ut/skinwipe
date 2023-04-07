require('../logger');
const cron = require('node-cron');
const Sentry = require('@sentry/node');
// const SteamPricer = require('steam-prices-module');

const loadMarketPrices = require('./background_workers/market/loadMarketPrices');

require('../discord');
const config = require('../config');

logger.info('==========[update prices worker started]==========');

if (config.sentry.enabled) {
  Sentry.init({ dsn: config.sentry.workers });
}

process.on('warning', e => console.error(e.stack));

const runChecks = {
  loadMarketPrices: false,
};

// const steamPricer = new SteamPricer();

cron.schedule('0 * * * *', async () => {
  runChecks.loadMarketPrices = false; // force restart;
});

cron.schedule('*/15 * * * *', async () => {
  if (runChecks.loadMarketPrices) {
    logger.error('loadMarketPrices is still running!');
    return;
  }
  runChecks.loadMarketPrices = true;
  // try {
  await loadMarketPrices();
  // } catch (e) {
  //   console.log(e.toString());
  // }
  runChecks.loadMarketPrices = false;
});
