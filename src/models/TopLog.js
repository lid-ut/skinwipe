const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    steamId: String,
    partnerSteamId: String,
    action: String,
    amount: Number,
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamId: 1 });

module.exports = mongoose.model('TopLog', Schema);
