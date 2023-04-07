const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    appid: String,
    image: String,
    name: String,
    prices: {
      in: Number,
      out: Number,
      steam_in: Number,
      steam_out: Number,
      csgotm: Number,
      csgotmPercent: Number,
    },
  },
  {
    timestamps: true,
  },
);

Schema.index({ name: 1 });
Schema.index({ appid: 1 });

const MarketPrices = mongoose.model('MarketPrices', Schema);

module.exports = MarketPrices;
