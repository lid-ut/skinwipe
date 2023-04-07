const resetUserNotifications = require('./010_resetUserNotifications');
const inactive1 = require('./011_1dayInactive');
const inactive2 = require('./012_2daysInactive');
const inactive3 = require('./013_3daysInactive');
const inactive4 = require('./014_4daysInactive');
const inactive5 = require('./015_5daysInactive');
const twoDaysAfterInactive = require('./016_twoDaysAfterInactive');
const notRegistered10minutesInactive = require('./017_notRegistered10minutesInactive');
const notRegistered3DaysInactive = require('./018_notRegistered3DaysInactive');
const notRegistered6DaysInactive = require('./019_notRegistered6DaysInactive');
const notRegistered9DaysInactive = require('./020_notRegistered9DaysInactive');
const notRegistered30DaysInactive = require('./021_notRegistered30DaysInactive');
const day1WithoutActivity = require('./023_day1WithoutActivity');
const day2WithoutActivity = require('./024_day2WithoutActivity');

const closedAuction = require('./022_closedAuction');
const acceptBetPush = require('./025_acceptBetPush');
const rejectBetPush = require('./026_rejectBetPush');
const expiredBetPush = require('./028_expiredBetPush');
const auctionCWVNotification = require('./027_auctionCWVNotification');
const specialOfferPush = require('./029_specialOfferPush');

const questsNoActivity = require('./030_questsNoActivity');
const questsNotRewarded = require('./031_questsNotRewarded');
const questsNotActive2Days = require('./032_questsNotActive2Days');
const questsNotActive3Days = require('./033_questsNotActive3Days');

const newTradePush = require('./081_newTradePush.js');
const rejectedTrade = require('./082_tradeRejected.js');
const acceptedTrade = require('./083_tradeAccepted.js');
const finishedTradePush = require('./084_finishedTradePush.js');
const sendPush = require('./666_sendPush.js');
const newFriend = require('./111_newFriend.js');
const inviteFriends = require('./112_inviteFriends.js');
const closedSuperTrade = require('./073_closedSuperTrade.js');
const tradeCWVNotification = require('./091_tradeCWVaccepted');
const noSub1Day = require('./121_1dayNoSub.js');
const noSub7Days = require('./122_7daysNoSub.js');

const faqCoinsPush = require('./131_faqCoinsPush.js');
const upYourAuctionPush = require('./140_upYourAuctionPush.js');

const marketSkinTradeBanEnd = require('./141_marketSkinTradeBanEnd.js');

module.exports = {
  inactive1,
  inactive2,
  inactive3,
  inactive4,
  inactive5,
  twoDaysAfterInactive,
  notRegistered10minutesInactive,
  notRegistered3DaysInactive,
  notRegistered6DaysInactive,
  notRegistered9DaysInactive,
  notRegistered30DaysInactive,
  day1WithoutActivity,
  day2WithoutActivity,

  questsNoActivity,
  questsNotRewarded,
  questsNotActive2Days,
  questsNotActive3Days,

  closedAuction,
  noSub1Day,
  noSub7Days,
  acceptBetPush,
  rejectBetPush,
  expiredBetPush,
  newTradePush,
  rejectedTrade,
  acceptedTrade,
  finishedTradePush,
  auctionCWVNotification,
  specialOfferPush,
  tradeCWVNotification,
  sendPush,
  newFriend,
  inviteFriends,
  closedSuperTrade,
  resetUserNotifications,
  faqCoinsPush,
  upYourAuctionPush,
  marketSkinTradeBanEnd,
};
