require('../logger');
const cron = require('node-cron');
const Sentry = require('@sentry/node');
const { spawn } = require('child_process');

require('../discord');
const config = require('../config');

logger.info('==========[Notification Workers Started]==========');

if (config.sentry.enabled) {
  Sentry.init({ dsn: config.sentry.workers });
}

process.on('warning', e => console.error(e.stack));

const runChecks = {
  bets: true,
  noSub: true,
  auctions: true,
  newTradePush: true,
  finishedTradePush: true,
  sendPush: true,
  tradeCWVNotification: false,
  auctionCWVNotification: false,
  specialOfferPush: false,
  upYourAuctionPush: true,
  newFriendNotification: true,
  inviteFriendsNotification: true,
  resetUserNotifications: true,
  inactiveUsers: true,
  notRegisteredInactiveUsers: true,
  notRegistered10minutesInactive: true,
  inactiveWithoutActivity: true,
  faqCoinsPush: true,
  quests: true,
  questsNotRewarded: true,
  marketSkinTradeBanEnd: false,
};

cron.schedule('* * * * *', () => {
  if (runChecks.bets) {
    logger.error('bets is still running!');
    return;
  }
  runChecks.bets = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['bets'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.bets = false;
    logger.info('bets task finished');
  });
});

cron.schedule('* * * * *', () => {
  if (runChecks.noSub) {
    logger.error('noSub is still running!');
    return;
  }
  runChecks.noSub = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['noSub'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.noSub = false;
    logger.info('noSub task finished');
  });
});

cron.schedule('* * * * *', () => {
  if (runChecks.auctions) {
    logger.error('auctions is still running!');
    return;
  }
  runChecks.auctions = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['auctions'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.auctions = false;
    logger.info('auctions task finished');
  });
});

cron.schedule('* * * * *', () => {
  if (runChecks.newTradePush) {
    logger.error('newTradePush is still running!');
    return;
  }
  runChecks.newTradePush = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['newTradePush'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.newTradePush = false;
    logger.info('newTradePush task finished');
  });
});

cron.schedule('* * * * *', () => {
  if (runChecks.finishedTradePush) {
    logger.error('finishedTradePush is still running!');
    return;
  }
  runChecks.finishedTradePush = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['finishedTradePush'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.finishedTradePush = false;
    logger.info('finishedTradePush task finished');
  });
});

cron.schedule('* * * * *', () => {
  if (runChecks.sendPush) {
    logger.error('sendPush is still running!');
    return;
  }
  runChecks.sendPush = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['sendPush'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.sendPush = false;
    logger.info('sendPush task finished');
  });
});

cron.schedule('* * * * *', () => {
  if (runChecks.newFriendNotification) {
    logger.error('newFriendNotification is still running!');
    return;
  }
  runChecks.newFriendNotification = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['newFriendNotification'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.newFriendNotification = false;
    logger.info('newFriendNotification task finished');
  });
});

cron.schedule('* * * * *', () => {
  if (runChecks.inviteFriendsNotification) {
    logger.error('inviteFriendsNotification is still running!');
    return;
  }
  runChecks.inviteFriendsNotification = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['inviteFriendsNotification'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.inviteFriendsNotification = false;
    logger.info('inviteFriendsNotification task finished');
  });
});

cron.schedule('* * * * *', () => {
  if (runChecks.tradeCWVNotification) {
    logger.error('tradeCWVNotification is still running!');
    return;
  }
  runChecks.tradeCWVNotification = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['tradeCWVNotification'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.tradeCWVNotification = false;
    logger.info('tradeCWVNotification task finished');
  });
});

cron.schedule('*/2 * * * *', () => {
  if (runChecks.auctionCWVNotification) {
    logger.error('auctionCWVNotification is still running!');
    return;
  }
  runChecks.auctionCWVNotification = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['auctionCWVNotification'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.auctionCWVNotification = false;
    logger.info('auctionCWVNotification task finished');
  });
});

cron.schedule('0 * * * *', () => {
  if (runChecks.specialOfferPush) {
    logger.error('specialOfferPush is still running!');
    return;
  }
  runChecks.specialOfferPush = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['specialOfferPush'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.specialOfferPush = false;
    logger.info('specialOfferPush task finished');
  });
});

cron.schedule('*/5 * * * *', () => {
  if (runChecks.upYourAuctionPush) {
    logger.error('upYourAuctionPush is still running!');
    return;
  }
  runChecks.upYourAuctionPush = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['upYourAuctionPush'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.upYourAuctionPush = false;
    logger.info('upYourAuctionPush task finished');
  });
});

cron.schedule('55 * * * *', () => {
  if (runChecks.resetUserNotifications) {
    logger.error('resetUserNotifications is still running!');
    return;
  }
  runChecks.resetUserNotifications = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['resetUserNotifications'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.resetUserNotifications = false;
    logger.info('resetUserNotifications task finished');
  });
});

cron.schedule('55 10 * * *', () => {
  if (runChecks.inactiveUsers) {
    logger.error('inactiveUsers is still running!');
    return;
  }
  runChecks.inactiveUsers = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['inactiveUsers'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.inactiveUsers = false;
    logger.info('inactiveUsers task finished');
  });
});

cron.schedule('* * * * *', () => {
  if (runChecks.notRegistered10minutesInactive) {
    logger.error('notRegistered10minutesInactive is still running!');
    return;
  }
  runChecks.notRegistered10minutesInactive = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['notRegistered10minutesInactive'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.notRegistered10minutesInactive = false;
    logger.info('notRegistered10minutesInactive task finished');
  });
});

cron.schedule('55 10 * * *', () => {
  if (runChecks.notRegisteredInactiveUsers) {
    logger.error('notRegisteredInactiveUsers is still running!');
    return;
  }
  runChecks.notRegisteredInactiveUsers = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['notRegisteredInactiveUsers'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.notRegisteredInactiveUsers = false;
    logger.info('notRegisteredInactiveUsers task finished');
  });
});

cron.schedule('55 10 * * *', () => {
  if (runChecks.inactiveWithoutActivity) {
    logger.error('inactiveWithoutActivity is still running!');
    return;
  }
  runChecks.inactiveWithoutActivity = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['inactiveWithoutActivity'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.inactiveWithoutActivity = false;
    logger.info('inactiveWithoutActivity task finished');
  });
});

cron.schedule('55 10 * * *', () => {
  if (runChecks.quests) {
    logger.error('quests is still running!');
    return;
  }
  runChecks.quests = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['questsInactive'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.quests = false;
    logger.info('quests task finished');
  });
});

cron.schedule('0 * * * *', () => {
  if (runChecks.questsNotRewarded) {
    logger.error('questsNotRewarded is still running!');
    return;
  }
  runChecks.questsNotRewarded = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['questsNotRewarded'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.questsNotRewarded = false;
    logger.info('questsNotRewarded task finished');
  });
});

cron.schedule('30 12 * * *', () => {
  if (runChecks.faqCoinsPush) {
    logger.error('faqCoinsPush is still running!');
    return;
  }
  runChecks.faqCoinsPush = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['faqCoinsPush'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.faqCoinsPush = false;
    logger.info('faqCoinsPush task finished');
  });
});

cron.schedule('* * * * *', () => {
  if (runChecks.marketSkinTradeBanEnd) {
    logger.error('marketSkinTradeBanEnd is still running!');
    return;
  }
  runChecks.marketSkinTradeBanEnd = true;
  const child = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', ['marketSkinTradeBanEnd'], {
    env: process.env,
    stdio: 'inherit',
  });
  child.on('close', () => {
    runChecks.marketSkinTradeBanEnd = false;
    logger.info('marketSkinTradeBanEnd task finished');
  });
});
