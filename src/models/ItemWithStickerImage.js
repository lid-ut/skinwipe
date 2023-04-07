// Mongodb
const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    appid: Number,
    imageUrl: String,
    name: String,
    steamId: String,
    stickers: Array,
  },
  {
    timestamps: true,
  },
);

Schema.index({ name: 1, steamId: 1 });

const ItemWithStickerImage = mongoose.model('ItemWithStickerImage', Schema);

module.exports = ItemWithStickerImage;
