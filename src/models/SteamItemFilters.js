// Mongodb
const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    570: {
      Rarity: Array,
      Quality: Array,
      Hero: Array,
      Type: Array,
      Slot: Array,
    },
    730: {
      Rarity: Array,
      Quality: Array,
      Type: Array,
      Weapon: Array,
      ItemSet: Array,
      Exterior: Array,
    },
    440: {
      Class: Array,
      Quality: Array,
      Type: Array,
      Weapon: Array,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('SteamItemFilters', Schema);
