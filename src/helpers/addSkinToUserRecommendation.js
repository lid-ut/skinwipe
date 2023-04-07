const UserSkinRecommendation = require('../models/UserSkinRecommendation');

module.exports = async (steamId, appId, assetId = null, skinName = null) => {
  let recommendation = await UserSkinRecommendation.findOne({ steamId, appId });
  if (!recommendation) {
    recommendation = new UserSkinRecommendation({ steamId, appId });
    await recommendation.save();
  }
  if (!recommendation.skinsAssetIds) {
    recommendation.skinsAssetIds = [];
  }
  if (!recommendation.skinsNames) {
    recommendation.skinsNames = [];
  }
  if (assetId) {
    recommendation.skinsAssetIds.push(assetId);
    recommendation.skinsAssetIds = recommendation.skinsAssetIds.filter((item, pos) => {
      return recommendation.skinsAssetIds.indexOf(item) === pos;
    });
  }
  if (skinName) {
    recommendation.skinsNames.push(skinName);
    recommendation.skinsNames = recommendation.skinsNames.filter((item, pos) => {
      return recommendation.skinsNames.indexOf(item) === pos;
    });
  }
  await UserSkinRecommendation.updateOne({ _id: recommendation._id }, { $set: recommendation });
};
