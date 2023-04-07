const mongoose = require('../db/mongoose-connection');
const getUserByXAT = require('./User/getUserByXAT');
const setXAccessToken = require('./User/setXAccessToken');

require('./FirebaseToken');

const Schema = new mongoose.Schema(
  {
    steamId: String,
    email: String,
    statusMessage: String,

    etherAddress: String,
    etherIndex: String,
    etherBalance: String,

    profileurl: String,
    tradeUrl: String,
    apiKey: String,
    oldApiKey: String,
    closeMarketTrades: { type: Number, default: 0 },
    endMarketTrades: { type: Number, default: 0 },

    personaname: String,

    avatar: String,
    avatarmedium: String,
    avatarfull: String,

    communityvisibilitystate: Number,
    profilestate: Number,
    lastlogoff: Number,
    commentpermission: Number,
    personastate: Number,
    realname: String,
    primaryclanid: String,
    timecreated: Number,
    personastateflags: Number,
    haveTradeHistory: Boolean,

    xAccessToken: [String],
    achievements: [String],

    coinCount: { type: Number, default: 0 },
    allSkinsCount: { type: Number, default: 0 },
    allSkinsPrice: { type: Number, default: 0 },

    stats: {
      gotTrades: Number,
      createdTrades: { type: Number, default: 0 },
      finishedTrades: { type: Number, default: 0 },
      createdAutoTrades: { type: Number, default: 0 },
      finishedAutoTrades: { type: Number, default: 0 },
      createdAuctions: { type: Number, default: 0 },
      finishedAuctions: { type: Number, default: 0 },
      acceptedTrades: { type: Number, default: 0 },
      successfulAuctions: { type: Number, default: 0 },
    },

    faceIt: {
      status: Number,
      nickname: String,
      realName: String,
      faceId: Number,
      photoUrl: String,
    },

    lastSteamItemsUpdate: { type: Date, default: Date.now },
    lastSteamItemsUpdateInProgress: Boolean,
    steamItemsUpdateTries: Number,
    steamItemsUpdateCount: Number,

    locale: String,

    devices: [
      {
        os: String,
        os_version: String,
        model: String,
        locale: String,
        app_version: String,
      },
    ],

    wishlist: [String], // STEAM ITEMS IDS
    exchange: [String], // USER STEAM ITEMS IDS

    subscriber: { type: Boolean, default: false },

    subInfo: [Object],

    gotPremiumDiscountAfterInactive: Boolean,
    gotPremiumDiscountDateStart: { type: Date, default: null },

    traderRating: { type: Number, default: 0 },
    traderRatingFreeUpDate: [{ type: Date, default: null }],

    bans: {
      escrow: Boolean,
      DotA2: Boolean,
      CSGO: Boolean,
      TRADEBAN: Boolean,
    },

    ssNikFirstReward: Boolean,
    steamFriends: [String],

    playerBans: {
      CommunityBanned: Boolean,
      VACBanned: Boolean,
      NumberOfVACBans: Number,
      DaysSinceLastBan: Number,
      NumberOfGameBans: Number,
      EconomyBan: String,
    },

    bot: {
      accountName: String,
      password: String,
    },

    lastActiveDate: { type: Date, default: Date.now },

    mobileActiveDates: [String],
    webActiveDates: [String],

    notifications: Object,

    ipAddress: String,

    invitationCode: String,
    myInvitationCode: String,
    mySkinInvitationPoints: Number,
    mySkinInvitationUsers: Number,

    tester: Boolean,
    abuser: Boolean,
    chatBanned: Boolean,
    bookMarked: Boolean,
    banned: Boolean,
    bannedPermanent: Boolean,
    bannedCode: String,
    bannedReason: String,
    bannedTime: Number,

    marketBan: Boolean,
    marketBanTime: Number,

    supportResolved: Boolean,

    gotPremiumAfterTradeBan: Boolean,
    showTrialCancelledSpecialOffer: Boolean,
    trialCancelledSpecialOfferLastChance: Date,

    faqCoinsSent: Boolean,

    topPoints: Number,

    specialCodes: [String],
    blacklist: [String],
    friends: [String],

    blackListedItems: [
      {
        appid: Number,
        name: String,
        assetid: String,
      },
    ],

    oldBlackListedItems: [
      {
        appid: Number,
        name: String,
        assetid: String,
      },
    ],

    reviews: {
      avg: Number,
      count: Number,
    },

    lastTradeRise: { type: Date, default: new Date(0) },
    lastAuctionRise: { type: Date, default: new Date(0) },
    lastProfileRise: { type: Date, default: new Date(0) },

    upPremiumRatingDate: { type: Date, default: Date.now },

    amplitudeDeviceId: String,
    constraint: {
      premiumOnly: { type: Boolean, default: false },
      minInvSum: Number,
    },
    ads: [String],
    adsReward: [String],
    stories: [String],
    money: { type: Number, default: 0 },
    b2pmoney: { type: Number, default: 0 },
    steamAuth: {
      sessionid: String,
      steamMachineAuth: String,
      steamLoginSecure: String,
    },
  },
  {
    timestamps: true,
  },
);

Schema.virtual('firebaseTokens', {
  ref: 'FirebaseToken',
  localField: 'steamId',
  foreignField: 'steamId',
  justOne: false,
});

Schema.index({ steamFriends: 1 });
Schema.index({ lastSteamItemsUpdate: 1 });
Schema.index({ allSkinsPrice: 1 });
Schema.index({ money: 1 });
Schema.index({ myInvitationCode: 1 });
Schema.index({ friends: 1 });
Schema.index({ invitationCode: 1 });
Schema.index({ personaname: 1 });
Schema.index({ ipAddress: 1 });
Schema.index({ lastActiveDate: -1 });
Schema.index({ traderRating: -1 });
Schema.index({ lastSteamItemsUpdateInProgress: -1 });
Schema.index({ upPremiumRatingDate: 1 });
Schema.index({ topPoints: -1 });
Schema.index({ steamId: 1 });
Schema.index({ coinCount: 1 });
Schema.index({ xAccessToken: 1 });
Schema.index({ etherAddress: 1 });

Schema.index({ 'subInfo.purchaseTime': 1 });
Schema.index({ 'subInfo.topPointsAdded': 1 });
Schema.index({ 'subInfo.purchaseDateMs': 1 });

Schema.statics.getUserByXAT = getUserByXAT;
Schema.statics.setXAccessToken = setXAccessToken;

module.exports = mongoose.model('User', Schema);
