const mongoose = require('../db/mongoose-connection');

const Schema = new mongoose.Schema(
  {
    steamId: String,
    appId: Number,
    skinsAssetIds: [String],
    skinsNames: [String],
  },
  {
    timestamps: true,
  },
);

Schema.index({ steamId: 1 });
Schema.index({ steamId: 1, appId: 1 });

module.exports = mongoose.model('UserSkinRecommendation', Schema);
