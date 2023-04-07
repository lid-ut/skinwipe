const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    appId: String,
    type: String,
    status: String,
  },
  {
    timestamps: true,
  },
);

Schema.index({ appId: 1, type: 1 });
Schema.index({ createdAt: 1 });

const SteamStatus = mongoose.model('SteamStatus', Schema);

module.exports = SteamStatus;
