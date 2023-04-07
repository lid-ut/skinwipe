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
  tradeCWVNotification: false,
  auctionCWVNotification: false,
};

cron.schedule('*/20 * * * * *', () => {
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
