const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    steamid: String,
    name: String,
    register: String,
    server: String,
    ban: Boolean,
    tradeUrl: String,
    csgotmKey: String,
    csgotmBalance: Number,
    apiKey: String,
    tier: Number,
    timecreated: Number,
    attempt: Number,
    active: Boolean,
    canSell: Boolean,
    itemsUpdated: Boolean,
    itemsCount: Number,
    lastTradeSend: Date,
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamid: 1 });
Schema.index({ name: 1 });

const BotSteam = mongoose.model('BotSteam', Schema);

module.exports = BotSteam;
