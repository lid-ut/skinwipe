const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    name: String,
    assetid: String,
    stickers: [Object],
    steam: {
      mean: Number,
      safe: Number,
      base: Number,
      converted: Number,
    },
  },
  {
    timestamps: true,
  },
);

Schema.index({ assetid: 1 });
Schema.index({ name: 1 });

const BotSteamPrice = mongoose.model('BotSteamPrice', Schema);

module.exports = BotSteamPrice;
