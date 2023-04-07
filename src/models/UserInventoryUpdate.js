const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    appId: String,
    steamId: String,
    lostItems: [Object],
    newItems: [Object],
  },
  {
    timestamps: true,
  },
);

Schema.virtual('user', {
  ref: 'User',
  localField: 'steamId',
  foreignField: 'steamId',
  justOne: true,
});

Schema.index({ steamId: 1 });
Schema.index({ 'lostItems.name': 1 });
Schema.index({ 'newItems.name': 1 });

const UserInventoryUpdate = mongoose.model('UserInventoryUpdate', Schema);

module.exports = UserInventoryUpdate;
