// Mongodb
const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    appid: Number,
    imageUrl: String,
    steamImageUrl: String,
    name: String,
    type: String,
    skinName: String,
  },
  {
    timestamps: true,
  },
);
Schema.index({ name: 1 });

const ItemImage = mongoose.model('ItemImage', Schema);

module.exports = ItemImage;
