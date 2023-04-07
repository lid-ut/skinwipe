require('../logger');
const fetch = require('node-fetch');
const FloatAsseId = require('../src/models/FloatAssetId');

FloatAsseId.aggregate([
  {
    $group: {
      _id: { aid: '$assetId' },
      aid: { $last: '$assetId' },
      ids: { $addToSet: '$_id' },
      sum: { $sum: 1 },
    },
  },
  {
    $match: { sum: { $gt: 1 } },
  },
]).then(async assets => {
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    logger.info(`[${i + 1}/${assets.length}] asset: ${asset.aid} ${asset.sum}`);
    // console.log(asset.ids[0]);
    asset.ids.shift();
    // console.log(asset.ids);
    await FloatAsseId.deleteMany({ _id: { $in: asset.ids } });
  }
  logger.info('Done!');
  process.exit(1);
});
