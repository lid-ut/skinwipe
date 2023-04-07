require('./logger');
const Sentry = require('@sentry/node');
const gulp = require('gulp');
const config = require('./config');
require('./discord');

if (config.sentry.enabled) {
  Sentry.init({ dsn: config.sentry.workers });
}

const notificationWorkers = require('./notifications/background_workers/index');

const noSub1Day = notificationWorkers.noSub1Day;
const noSub7Days = notificationWorkers.noSub7Days;
const newTradePush = notificationWorkers.newTradePush;
const rejectedTrade = notificationWorkers.rejectedTrade;
const acceptedTrade = notificationWorkers.acceptedTrade;
const finishedTradePush = notificationWorkers.finishedTradePush;
const tradeCWVNotification = notificationWorkers.tradeCWVNotification;
const sendPush = notificationWorkers.sendPush;
const newFriend = notificationWorkers.newFriend;
const inviteFriends = notificationWorkers.inviteFriends;
const resetUserNotifications = notificationWorkers.resetUserNotifications;

const inactive1 = notificationWorkers.inactive1;
const inactive2 = notificationWorkers.inactive2;
const inactive3 = notificationWorkers.inactive3;
const inactive4 = notificationWorkers.inactive4;
const inactive5 = notificationWorkers.inactive5;
const twoDaysAfterInactive = notificationWorkers.twoDaysAfterInactive;
const notRegistered10minutesInactive = notificationWorkers.notRegistered10minutesInactive;
const notRegistered3DaysInactive = notificationWorkers.notRegistered3DaysInactive;
const notRegistered6DaysInactive = notificationWorkers.notRegistered6DaysInactive;
const notRegistered9DaysInactive = notificationWorkers.notRegistered9DaysInactive;
const notRegistered30DaysInactive = notificationWorkers.notRegistered30DaysInactive;
const day1WithoutActivity = notificationWorkers.day1WithoutActivity;
const day2WithoutActivity = notificationWorkers.day2WithoutActivity;

const questsNoActivity = notificationWorkers.questsNoActivity;
const questsNotRewarded = notificationWorkers.questsNotRewarded;
const questsNotActive2Days = notificationWorkers.questsNotActive2Days;
const questsNotActive3Days = notificationWorkers.questsNotActive3Days;

const closedAuction = notificationWorkers.closedAuction;
const auctionCWVNotification = notificationWorkers.auctionCWVNotification;
const specialOfferPush = notificationWorkers.specialOfferPush;
const acceptBetPush = notificationWorkers.acceptBetPush;
const rejectBetPush = notificationWorkers.rejectBetPush;
const expiredBetPush = notificationWorkers.expiredBetPush;
const faqCoinsPush = notificationWorkers.faqCoinsPush;
const upYourAuctionPush = notificationWorkers.upYourAuctionPush;
const marketSkinTradeBanEnd = notificationWorkers.marketSkinTradeBanEnd;

const finish = done => {
  done();
  process.exit(1);
};

module.exports.sendPush = gulp.series(sendPush, finish);
module.exports.expiredBetPush = gulp.series(expiredBetPush, finish);
module.exports.noSub = gulp.series(noSub1Day, noSub7Days, finish);
module.exports.bets = gulp.series(acceptBetPush, rejectBetPush, expiredBetPush, finish);
module.exports.newTradePush = gulp.series(newTradePush, rejectedTrade, acceptedTrade, finish);
module.exports.finishedTradePush = gulp.series(finishedTradePush, finish);
module.exports.tradeCWVNotification = gulp.series(tradeCWVNotification, finish);
module.exports.newFriendNotification = gulp.series(newFriend, finish);
module.exports.inviteFriendsNotification = gulp.series(inviteFriends, finish);
module.exports.resetUserNotifications = gulp.series(resetUserNotifications, finish);

module.exports.inactive1 = gulp.series(inactive1, finish);
module.exports.inactiveUsers = gulp.series(inactive1, inactive2, inactive3, inactive4, inactive5, twoDaysAfterInactive, finish);
module.exports.notRegistered10minutesInactive = gulp.series(notRegistered10minutesInactive, finish);
module.exports.notRegisteredInactiveUsers = gulp.series(
  notRegistered3DaysInactive,
  notRegistered6DaysInactive,
  notRegistered9DaysInactive,
  notRegistered30DaysInactive,
  finish,
);
module.exports.inactiveWithoutActivity = gulp.series(day1WithoutActivity, day2WithoutActivity, finish);

module.exports.questsInactive = gulp.series(questsNoActivity, questsNotActive2Days, questsNotActive3Days, finish);
module.exports.questsNotRewarded = gulp.series(questsNotRewarded, finish);

module.exports.closedAuction = gulp.series(closedAuction, finish);
module.exports.auctionCWVNotification = gulp.series(auctionCWVNotification, finish);
module.exports.specialOfferPush = gulp.series(specialOfferPush, finish);
module.exports.auctions = gulp.series(closedAuction, finish);
module.exports.faqCoinsPush = gulp.series(faqCoinsPush, finish);
module.exports.upYourAuctionPush = gulp.series(upYourAuctionPush, finish);
module.exports.marketSkinTradeBanEnd = gulp.series(marketSkinTradeBanEnd, finish);

module.exports.default = finish;
