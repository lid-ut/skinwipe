require('../logger');
const cron = require('node-cron');
const Sentry = require('@sentry/node');

const initSequelize = require('../src/modules/sequelize/init');

initSequelize(() => {
  console.log('postgres start');
});

const marketCheckTrades = require('./background_workers/market/checkTrades');
const marketClear = require('./background_workers/market/clear');
const marketCloseTrades = require('./background_workers/market/closeTrades');
// const handleMoneyTransactions = require('./background_workers/market/handleMoneyTransactions');
const sendTransactions = require('./background_workers/market/sendTransactions');

require('../discord');
const config = require('../config');

logger.info('==========[market check trades worker started]==========');

if (config.sentry.enabled) {
  Sentry.init({ dsn: config.sentry.workers });
}

process.on('warning', e => console.error(e.stack));

const runChecks = {
  marketCheckTrades: false,
  handleMoneyTransactions: false,
  marketCloseTrades: false,
  marketClear: false,
  sendTransactions: false,
};

cron.schedule('1 * * * *', () => {
  runChecks.marketCheckTrades = false;
});

cron.schedule('*/15 * * * * *', async () => {
  if (runChecks.marketCheckTrades) {
    return;
  }
  runChecks.marketCheckTrades = true;
  try {
    await marketCheckTrades();
  } catch (e) {
    console.log(e.toString());
  }
  runChecks.marketCheckTrades = false;
});

// cron.schedule('*/30 * * * *', async () => {
//   if (runChecks.handleMoneyTransactions) {
//     return;
//   }
//   runChecks.handleMoneyTransactions = true;
//   try {
//     await handleMoneyTransactions();
//   } catch (e) {
//     console.log(e.toString());
//   }
//   runChecks.handleMoneyTransactions = false;
// });

cron.schedule('*/5 * * * * *', async () => {
  if (runChecks.marketCloseTrades) {
    return;
  }
  runChecks.marketCloseTrades = true;
  try {
    await marketCloseTrades();
  } catch (e) {
    console.log(e.toString());
  }
  runChecks.marketCloseTrades = false;
});

cron.schedule('*/15 * * * * *', async () => {
  if (runChecks.marketClear) {
    return;
  }
  runChecks.marketClear = true;
  try {
    await marketClear();
  } catch (e) {
    console.log(e.toString());
  }
  runChecks.marketClear = false;
});

cron.schedule('*/10 * * * * *', async () => {
  if (runChecks.sendTransactions) {
    return;
  }
  runChecks.sendTransactions = true;
  try {
    await sendTransactions();
  } catch (e) {
    console.log(e.toString());
  }
  runChecks.sendTransactions = false;
});
