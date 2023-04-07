const mongoose = require('../db/mongoose-connection');

const schema = new mongoose.Schema(
  {
    steamId: String,
    status: String, // open, close, processed

    dateCreate: {
      type: Date,
      default: Date.now,
    },
    expiresAt: Date,

    items: [Object],
    allSkinsPrice: Number,

    message: String,
    premium: Boolean,
    subscriber: Boolean,
    paid: Boolean,
    disableComments: Boolean,
    games: [String],
    minSkinPrice: Number,
    minBetPrice: Number,

    likes: [String],
    notifications: Object,

    itemChecks: Number,
    autoClose: Boolean,

    views: {
      type: Number,
      default: 0,
    },

    bets: [
      {
        steamId: String,
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        trade: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Trade',
        },
        tradeObject: {
          _id: mongoose.Schema.Types.ObjectId,
          notifications: Object,

          items: [Object],

          myAllSkinsPrice: Number,
          hisAllSkinsPrice: Number,

          close: Boolean,
          code: String,
          status: String, // new, edited, accepted, reject,

          steamTradeStatus: String, // not send, send, received, confirmed, finished, reject
          steamTradeID: String,
          steamTradeComment: String,
          steamError: String,

          steamLastSendPushCheck: {
            type: Date,
            default: Date.now(),
          },
          steamSendPushCount: Number,

          dates: {
            created: {
              type: Date,
              default: Date.now,
            },
            accepted: Date,
            rejected: Date,
            finished: Date,
          },
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

schema.virtual('user', {
  ref: 'User',
  localField: 'steamId',
  foreignField: 'steamId',
  justOne: true,
});

schema.index({ steamId: 1 });
schema.index({ status: 1 });

schema.index({ dateCreate: -1 });
schema.index({ expiresAt: 1 });

schema.index({ allSkinsPrice: -1 });

schema.index({ premium: 1 });
schema.index({ subscriber: 1 });

schema.index({ subscriber: 1 });
schema.index({ 'items.name': 1 });
schema.index({ 'items.assetid': 1 });
schema.index({ 'items.appid': 1 });
schema.index({ 'bets.tradeObject._id': 1 });
schema.index({ 'bets.tradeObject.items.name': 1 });
schema.index({ 'bets.tradeObject.items.assetid': 1 });
schema.index({ 'bets.tradeObject.status': 1 });
schema.index({ 'bets.steamId': 1 });
schema.index({ 'bets._id': 1 });
schema.index({ 'notifications.ending': 1 });
schema.index({ 'bets.tradeObject.notifications.created': 1 });
schema.index({ 'bets.tradeObject.notifications.closed': 1 });
schema.index({ 'bets.tradeObject.notifications.accepted': 1 });
schema.index({ 'bets.tradeObject.notifications.rejected': 1 });
schema.index({ itemChecks: 1 });

module.exports = mongoose.model('Auction', schema);
