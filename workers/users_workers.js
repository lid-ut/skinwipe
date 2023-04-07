require('../logger');
const cron = require('node-cron');
const Sentry = require('@sentry/node');
require('../discord');
const config = require('../config');

const recheckPremium = require('./background_workers/subscribe/recheckPremium');
const offlineUserRating = require('./background_workers/users/offlineUserRating');
const calculateActiveUsersToday = require('./background_workers/users/calculateActiveUsersToday');
const calculateSettings = require('./background_workers/users/calculateSettings');
const skinSwipeNicknameReward = require('./background_workers/users/skinSwipeNicknameReward');
const jail = require('./background_workers/users/jail');
const nextQuest = require('./background_workers/users/nextQuest');
const handleMoneyTransactions = require('./background_workers/market/handleMoneyTransactions');
const fetchSteamStatus = require('./background_workers/users/fetchSteamStatus');

logger.info('==========[users workers started]==========');

if (config.sentry.enabled) {
  Sentry.init({ dsn: config.sentry.workers });
}

process.on('warning', e => console.error(e.stack));

const runChecks = {
  recheckPremium: false,
  offlineUserRating: false,
  calculateActiveUsersToday: false,
  calculateSettings: false,
  skinSwipeNicknameReward: false,
  jail: false,
  nextQuest: false,
  handleMoneyTransactions: false,
  fetchSteamStatus: false,
};

cron.schedule('0 * * * *', async () => {
  if (runChecks.recheckPremium) {
    logger.error('recheckPremium is still running!');
    return;
  }
  runChecks.recheckPremium = true;
  // try {
  await recheckPremium();
  // } catch (e) {
  //   console.log(e.toString());
  // }
  runChecks.recheckPremium = false;
});

cron.schedule('12 22 * * * *', async () => {
  if (runChecks.offlineUserRating) {
    logger.error('offlineUserRating is still running!');
    return;
  }
  runChecks.offlineUserRating = true;
  // try {
  await offlineUserRating();
  // } catch (e) {
  //   console.log(e.toString());
  // }
  runChecks.offlineUserRating = false;
});

cron.schedule('*/10 * * * *', async () => {
  if (runChecks.calculateActiveUsersToday) {
    logger.error('calculateActiveUsersToday is still running!');
    return;
  }
  runChecks.calculateActiveUsersToday = true;
  // try {
  await calculateActiveUsersToday();
  // } catch (e) {
  //   console.log(e.toString());
  // }
  runChecks.calculateActiveUsersToday = false;
});

cron.schedule('* * * * *', async () => {
  if (runChecks.calculateSettings) {
    logger.error('calculateSettings is still running!');
    return;
  }
  runChecks.calculateSettings = true;
  // try {
  await calculateSettings();
  // } catch (e) {
  //   console.log(e.toString());
  // }
  runChecks.calculateSettings = false;
});

cron.schedule('6 0 * * *', async () => {
  if (runChecks.skinSwipeNicknameReward) {
    logger.error('skinSwipeNicknameReward is still running!');
    return;
  }
  runChecks.skinSwipeNicknameReward = true;
  // try {
  await skinSwipeNicknameReward();
  // } catch (e) {
  //   console.log(e.toString());
  // }
  runChecks.skinSwipeNicknameReward = false;
});

cron.schedule('* * * * *', async () => {
  if (runChecks.jail) {
    logger.error('jail is still running!');
    return;
  }
  runChecks.jail = true;
  // try {
  await jail();
  // } catch (e) {
  //   console.log(e.toString());
  // }
  runChecks.jail = false;
});

cron.schedule('1 * * * *', async () => {
  if (runChecks.nextQuest) {
    logger.error('nextQuest is still running!');
    return;
  }
  runChecks.nextQuest = true;
  // try {
  await nextQuest();
  // } catch (e) {
  //   console.log(e.toString());
  // }
  runChecks.nextQuest = false;
});

cron.schedule('1 * * * *', async () => {
  if (runChecks.handleMoneyTransactions) {
    logger.error('handleMoneyTransactions is still running!');
    return;
  }

  runChecks.handleMoneyTransactions = true;
  try {
    await handleMoneyTransactions();
  } catch (e) {
    console.log(e);
  }
  runChecks.handleMoneyTransactions = false;
});

cron.schedule('*/30 * * * *', async () => {
  if (runChecks.fetchSteamStatus) {
    logger.error('fetchSteamStatus is still running!');
    return;
  }
  runChecks.fetchSteamStatus = true;
  // try {
  await fetchSteamStatus();
  // } catch (e) {
  //   console.log(e.toString());
  // }
  runChecks.fetchSteamStatus = false;
});
