// Mongodb
const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    steamId: String,
    assetId: String,
    action: String,
    float: String,

    floatInt: Number,
    itemId: String,
    defIndex: Number,
    paintIndex: Number,
    paintWear: Number,
    paintSeed: Number,
    killEaterValue: Number,
    customName: String,
    origin: Number,
    min: Number,
    max: Number,
    itemName: String,
    originName: String,

    stickers: [
      {
        codename: String,
        name: String,
        rotation: String,
        scale: String,
        slot: Number,
        stickerId: Number,
        tintId: Number,
        wear: Number,
      },
    ],
  },
  {
    timestamps: true,
  },
);

Schema.index({ assetId: 1 });
Schema.index({ steamId: 1 });
Schema.index({ action: 1 });
Schema.index({ float: 1 });

const FloatAssetId = mongoose.model('floatassetid', Schema);

module.exports = FloatAssetId;
