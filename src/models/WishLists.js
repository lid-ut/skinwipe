// Mongodb
const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    steamId: String,
    steamItems: [Object],
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamId: 1 });

module.exports = mongoose.model('Wishlist', Schema);
