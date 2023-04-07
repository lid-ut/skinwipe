const mongoose = require('../db/mongoose-connection');

const IntersectionSchema = new mongoose.Schema(
  {
    userSteamId: String,
    filters: { type: String, unique: 'Already save' },
    iWantRarityArray: [
      {
        name: String,
        appId: String,
        count: Number,
      },
    ],
    imageTopArr: [Object],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Intersection', IntersectionSchema);
