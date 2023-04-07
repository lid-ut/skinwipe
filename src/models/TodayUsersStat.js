const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    activeUsers: Number,
    skinSwipeNicknameUsers: Number,
    monthlyActiveUsers: Number,
    mobileActiveUsers: Number,
    webActiveUsers: Number,
    codesEntered: Number,
    coinsCount: Number,
    coinsAdded: Number,
    coinsRevoked: Number,
    fireCoinsAdded: Number,
    fireCoinsRevoked: Number,
    messages: Number,
    messageWriters: Number,
    tradeMessages: Number,
    rooms: Number,

    subsActive: Number,
    subsNew: Number,
    subsDeclined: Number,

    superTradesCreated: Number,
    tradesCreated: Number,
    tradesDeclined: Number,
    tradesAccepted: Number,
    tradesCreators: Number,

    auctionsCreated: Number,
    auctionsCreators: Number,
    auctionsClosed: Number,
    auctionsAccepted: Number,

    regs: Number,
    regsTrade: Number,
    regsSuperTrade: Number,
    regsAuction: Number,

    supportCreated: Number,
    supportClosed: Number,

    paid: Object,
    paidAmounts: Object,

    advertTransactions: Number,
    advertUsers: Number,

    date: String,
  },
  {
    timestamps: true,
  },
);

Schema.index({ date: 1 });

module.exports = mongoose.model('TodayUsersStat', Schema);
