require('../logger');
const fetch = require('node-fetch');
const FloatAsseId = require('../src/models/FloatAssetId');

const processResponse = async function(asset, result) {
  if (result.error && result.code === 4) {
    await FloatAsseId.deleteOne({ _id: asset._id });
    return;
  }
  if (!result.iteminfo) {
    return;
  }
  if (result.iteminfo.floatvalue === 0) {
    result.iteminfo.floatvalue = 'unavailable';
  }
  console.log('[032] result.iteminfo.floatvalue:', result.iteminfo.floatvalue);
  await FloatAsseId.updateOne({ _id: asset._id }, { $set: { float: result.iteminfo.floatvalue } });
};

FloatAsseId.find({
  float: '0',
  action: { $nin: ['', null] },
  steamId: { $nin: ['', null] },
  assetId: { $nin: ['', null] },
})
  .limit(5)
  .then(async assets => {
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      const apiUrl = `https://api.csgofloat.com/?s=${asset.steamId}&a=${asset.assetId}&d=${asset.action}`;
      logger.info(`[032] apiUrl: ${apiUrl}`);
      let result = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      result = await result.text();
      if (result.indexOf('{') !== 0) {
        logger.error(`[032] result text: ${result}`);
        return;
      }
      result = JSON.parse(result);
      await processResponse(asset, result);
    }
    logger.info('[032] Done!');
    process.exit(1);
  });
