const request = require('request-promise');
const FloatAsseId = require('../../../src/models/FloatAssetId');
const BotSteamItem = require('../../../src/models/BotSteamItem');
const config = require('../../../config');

const processResponse = async (asset, result) => {
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

  const updateObj = {
    float: result.iteminfo.floatvalue,
    floatInt: result.iteminfo.floatvalue !== 'unavailable' ? Math.floor(result.iteminfo.floatvalue * 1000000000) : 0,
    itemId: result.iteminfo.itemid,
    defIndex: result.iteminfo.defindex,
    paintIndex: result.iteminfo.paintindex,
    paintWear: typeof result.iteminfo.floatvalue === 'number' ? Math.floor(result.iteminfo.floatvalue) : 0,
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

  await FloatAsseId.updateOne({ _id: asset._id }, { $set: updateObj });

  const paintWear = parseFloat(result.iteminfo.floatvalue || 0) || 0;

  await BotSteamItem.updateOne(
    { assetid: result.iteminfo.a },
    {
      $set: {
        float: result.iteminfo.floatvalue,
        paintWear,
        stickers: result.iteminfo.stickers,
      },
    },
  );
};

const proxies = config.proxies;
let pIndex = 0;

const saveFloat = async asset => {
  pIndex += 1;
  if (!proxies[pIndex]) {
    pIndex = 0;
  }
  const url = `https://api.csgofloat.com/?s=${asset.steamId}&a=${asset.assetId}&d=${asset.action}`;
  // const r = request.defaults({ proxy: proxies[pIndex] });
  const text = await request.get(url).catch(e => {
    e.toString();
    return '';
  });
  if (text.indexOf('{') !== 0) {
    return { json: text, status: 500 };
  }
  const result = JSON.parse(text);
  return processResponse(asset, result);
};

module.exports = async () => {
  const assets = await FloatAsseId.find({
    float: '0',
    action: { $nin: ['', null] },
    steamId: { $nin: ['', null] },
    assetId: { $nin: ['', null] },
  })
    .sort({ _id: 1 })
    .limit(25);
  const promiseArr = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const asset of assets) {
    promiseArr.push(saveFloat(asset));
  }
  await Promise.all(promiseArr);
};
