const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    steamId: String,
    steamIdPartner: String,
    code: String,
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    items: [Object],
    itemsPartner: [Object],

    myAllSkinsPrice: Number,
    hisAllSkinsPrice: Number,

    status: String, // new, edited, accepted, reject,

    close: Boolean,

    steamTradeStatus: String, // not send, send, received, confirmed, finished, reject
    steamTradeID: String,
    steamTradeComment: String,

    dates: {
      created: Date,
      accepted: Date,
      rejected: Date,
      finished: Date,
    },
    money: Number,
    notifications: Object,
    steamLastSendPushCheck: {
      type: Date,
      default: Date.now(),
    },
    steamSendPushCount: Number,

    tradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trade',
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamLastSendPushCheck: 1 });
Schema.index({ steamId: 1 });
Schema.index({ steamIdPartner: 1 });
Schema.index({ tradeId: 1 });
Schema.index({ code: 1 });

module.exports = mongoose.model('MessageTrade', Schema, 'messagetrades');
