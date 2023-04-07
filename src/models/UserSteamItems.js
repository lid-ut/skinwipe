const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    appId: String,
    steamId: String,
    lastCommonSave: Number,
    steamItems: [Object],
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamId: 1 });
Schema.index({ steamId: 1, appId: 1 }, { unique: true });
Schema.index({ 'steamItems.name': 1 });
Schema.index({ lastCommonSave: 1 });
Schema.index({ 'steamItems.assetid': 1 });
Schema.index({ 'steamItems.tradable': 1 });

const UserSteamItems = mongoose.model('UserSteamItems', Schema);

module.exports = UserSteamItems;
