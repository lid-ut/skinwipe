require('../logger');
const cron = require('node-cron');

const createSupertradesItems = require('./background_workers/p2ptrades/createSupertradesItems');
const closeOldTrades = require('./background_workers/p2ptrades/closeOldTrades');
const handleSuperTrades = require('./background_workers/p2ptrades/handleSuperTrades');
const closeOldAuctions = require('./background_workers/p2ptrades/closeOldAuctions');

const initSequelize = require('../src/modules/sequelize/init');
const p2pCheckTrades = require('./background_workers/p2ptrades/checkTrades');
const p2pTradesFindSteamTradeId = require('./background_workers/p2ptrades/findSteamTradeId');

initSequelize(() => {
  console.log('postgres start');
});

logger.info('==========[p2p trades worker started]==========');

const runChecks = {
  createOrUpdateSuperTradesItems: false,
  closeOldTrades: false,
  handleSuperTrades: false,
  closeOldAuctions: false,
  p2pCheckTrades: false,
  p2pTradesFindSteamTradeId: false,
};

cron.schedule('* * * * *', async () => {
  if (runChecks.p2pCheckTrades) {
    return;
  }
  runChecks.p2pCheckTrades = true;
  try {
    await p2pCheckTrades();
  } catch (e) {
    console.log(e.toString());
  }
  runChecks.p2pCheckTrades = false;
});

cron.schedule('*/5 * * * *', async () => {
  if (runChecks.p2pTradesFindSteamTradeId) {
    return;
  }
  runChecks.p2pTradesFindSteamTradeId = true;
  try {
    await p2pTradesFindSteamTradeId();
  } catch (e) {
    console.log(e.toString());
  }
  runChecks.p2pTradesFindSteamTradeId = false;
});

cron.schedule('30 * * * *', async () => {
  if (runChecks.createOrUpdateSuperTradesItems) {
    return;
  }
  runChecks.createOrUpdateSuperTradesItems = true;
  try {
    await createSupertradesItems();
  } catch (e) {
    console.log(e.toString());
  }
  runChecks.createOrUpdateSuperTradesItems = false;
});

cron.schedule('*/20 * * * * *', async () => {
  if (runChecks.closeOldTrades) {
    return;
  }
  runChecks.closeOldTrades = true;
  try {
    await closeOldTrades();
  } catch (e) {
    console.log(e.toString());
  }
  runChecks.closeOldTrades = false;
});

cron.schedule('*/10 * * * * *', async () => {
  if (runChecks.handleSuperTrades) {
    return;
  }
  runChecks.handleSuperTrades = true;
  try {
    await handleSuperTrades();
  } catch (e) {
    console.log(e.toString());
  }
  runChecks.handleSuperTrades = false;
});

cron.schedule('54 * * * *', async () => {
  if (runChecks.closeOldAuctions) {
    return;
  }
  runChecks.closeOldAuctions = true;
  try {
    await closeOldAuctions();
  } catch (e) {
    console.log(e.toString());
  }
  runChecks.closeOldAuctions = false;
});
