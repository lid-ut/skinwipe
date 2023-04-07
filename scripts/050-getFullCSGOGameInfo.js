require('../logger');
const fetch = require('node-fetch');
const FloatAssetId = require('../src/models/FloatAssetId');

const processResponse = async function(asset, result) {
  if (result.error && result.code === 4) {
    await FloatAssetId.deleteOne({ _id: asset._id });
    return;
  }
  if (!result.iteminfo) {
    return;
  }
  if (result.iteminfo.floatvalue === 0) {
    result.iteminfo.floatvalue = 'unavailable';
  }

  const updateObj = {
    float: result.iteminfo.floatvalue,
    floatInt: result.iteminfo.floatvalue !== 'unavailable' ? Math.floor(result.iteminfo.floatvalue * 1000000000) : 0,
    itemId: result.iteminfo.itemid,
    defIndex: result.iteminfo.defindex,
    paintIndex: result.iteminfo.paintindex,
    paintWear: result.iteminfo.paintwear,
    paintSeed: result.iteminfo.paintseed,
    killEaterValue: result.iteminfo.killeatervalue,
    customName: result.iteminfo.customname,
    origin: result.iteminfo.origin,
    min: result.iteminfo.min,
    max: result.iteminfo.max,
    itemName: result.iteminfo.item_name,
    originName: result.iteminfo.origin_name,
    stickers: result.iteminfo.stickers,
  };

  await FloatAssetId.updateOne({ _id: asset._id }, { $set: updateObj });
};

FloatAssetId.find({
  float: '0',
  action: { $nin: ['', null] },
  steamId: { $nin: ['', null] },
  assetId: { $nin: ['', null] },
})
  .limit(500)
  .then(async assets => {
    logger.info(`[050] start! ${new Date().getTime()}`);
    for (let i = 0; i < assets.length; i++) {
      logger.info(`[050] ${i} of ${assets.length}`);
      const asset = assets[i];
      const apiUrl = `http://88.198.146.179:8182/?s=${asset.steamId}&a=${asset.assetId}&d=${asset.action}`;
      // logger.info(`[050] apiUrl: ${apiUrl}`);
      let result = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      result = await result.text();
      if (result.indexOf('{') !== 0) {
        logger.error(`[050] result text: ${result}`);
        return;
      }
      result = JSON.parse(result);
      await processResponse(asset, result);
    }

    logger.info(`[050] Done! ${new Date().getTime()}`);
    process.exit(1);
  });
