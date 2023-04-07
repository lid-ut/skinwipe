const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    market: {
      server: {
        newBotItems: Boolean,
        virtual: Boolean,
      },
      feePremium: Number,
      fee: Number,
      instantSell: Boolean,
      all: Boolean,
      premium: Boolean,
      discount: Number,
      bonus: Number,
      poolling: Boolean,
      poollingInterval: Number,
      minInstantSkinPrice: Number,
      virtualResale: Boolean,
      instantSaleDiscountEnabled: Boolean,
      instantSaleDiscount: Number,
    },
    traders: {
      online: Number,
      all: Number,
      balance: Number,
    },
    testers: [String],
    enableLocalCartNotification: Boolean,
    fee: Number,
    USDtoRUB: Number,
    etherToUSD: Number,
    overstock: Number,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Settings', Schema, 'settings');
