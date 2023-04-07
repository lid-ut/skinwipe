const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    appId: String,
    name: String,
    update: Date,
    history: {
      week: [
        {
          price: Number,
          date: Date,
        },
      ],
      month: [
        {
          price: Number,
          date: Date,
        },
      ],
      year: [
        {
          price: Number,
          date: Date,
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

Schema.index({ appId: 1 });
Schema.index({ name: 1 });

const SteamPricesHistory = mongoose.model('SteamPricesHistory', Schema);

module.exports = SteamPricesHistory;
