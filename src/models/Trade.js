// Mongodb
const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    steamId: String,
    steamIdPartner: String,
    code: String,
    partnersSteamIds: [String],

    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    autoTrade: Boolean,
    accepted: { type: Boolean, default: false },

    usersReject: [String],
    notifications: Object,

    items: [Object],
    itemsPartner: [Object],

    myAllSkinsPrice: Number,
    hisAllSkinsPrice: Number,
    difference: Number,

    premium: Boolean,

    paid: Boolean,

    status: String, // new, edited, accepted, reject,

    close: Boolean,

    userClose: String,

    isOpened: Boolean,

    steamTradeStatus: String, // not send, send, received, confirmed, finished, reject

    steamTradeID: String,

    steamTradeComment: String,

    steamError: String,

    steamLastSendPushCheck: {
      type: Date,
      default: Date.now(),
    },
    steamSendPushCount: Number,

    datecreate: {
      type: Date,
      default: Date.now,
    },

    raisedAt: {
      type: Date,
      default: Date.now,
    },

    dates: {
      created: Date,
      accepted: Date,
      rejected: Date,
      finished: Date,
    },
    likes: [String],
    views: {
      type: Number,
      default: 0,
    },
    money: Number,
    attempts: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

Schema.index({ raisedAt: -1 });
Schema.index({ steamLastSendPushCheck: 1 });
Schema.index({ steamIdPartner: 1 });
Schema.index({ steamId: 1 });
Schema.index({ allSkinsPrice: 1 });
Schema.index({ myAllSkinsPrice: 1 });
Schema.index({ hisAllSkinsPrice: 1 });
Schema.index({ difference: 1 });
Schema.index({ status: 1 });
Schema.index({ close: 1 });
Schema.index({ steamTradeStatus: 1 });
Schema.index({ steamTradeID: 1 });
Schema.index({ accepted: 1 });
Schema.index({ code: 1 });
Schema.index({ autoTrade: 1 });
Schema.index({ money: 1 });
Schema.index({ usersReject: 1 });
Schema.index({ partnersSteamIds: 1 });
Schema.index({ attempts: 1 });
Schema.index({ 'items.name': 1 });
Schema.index({ 'items.appid': 1 });
Schema.index({ 'items.assetid': 1 });
Schema.index({ 'itemsPartner.name': 1 });
Schema.index({ 'notifications.finished': 1 });
Schema.index({ 'notifications.created': 1 });
Schema.index({ 'notifications.accept': 1 });
Schema.index({ 'notifications.closed': 1 });
Schema.index({ 'notifications.accepted': 1 });
Schema.index({ 'notifications.middle': 1 });
Schema.index({ 'notifications.rejected': 1 });
Schema.index({ 'notifications.ending': 1 });

module.exports = mongoose.model('Trade', Schema);
