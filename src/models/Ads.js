const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    active: Boolean,
    title: String,
    type: String,
    showAfter: Number,
    banner: Boolean,
    img: String,
    imgHeight: Number,
    imgWidth: Number,
    link: String,
    startDate: Date,
    endDate: Date,
    ssCoinsReward: Number,
    coinsReward: Number,
    premiumReward: Number,
    locale: String,
    oneClick: Boolean,
    showPremium: Boolean,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Ads', Schema, 'ads');
