const CommonItem = require('../../../../models/CommonItem');
const MarketPrices = require('../../../../models/MarketPrices');
const Settings = require('../../../../models/Settings');
const setStickerPrice = require('../setStickerPrice');

const saveItem = async (steamid, item) => {
  const marketPrice = await MarketPrices.findOne({ name: item.name });
  const setting = await Settings.findOne({});

  let commonItem = await CommonItem.findOne({ assetid: item.assetid });
  if (!commonItem) {
    if (!setting.market.server.newBotItems) {
      return false;
    }
    const marketObject = {
      ...item,
      visible: true,
      steamid,
    };
    commonItem = new CommonItem(marketObject);
  }

  // eslint-disable-next-line camelcase
  const steamOut = marketPrice ? marketPrice.prices.steam_out * 100 || 0 : 0;
  // let discount = 0.05;
  // if (out > 50) {
  //   discount = 0.01;
  // }
  // const mean = Math.round((out - out * discount) * 100);
  // const safe = Math.round((out - out * discount) * 100);
  let stickerPrice = 0;
  if (item.stickers && item.stickers.length > 0) {
    stickerPrice = await setStickerPrice(item);
    commonItem.stickers = item.stickers;
  }
  const mean = Math.round(steamOut + stickerPrice * 110);
  const safe = Math.round(steamOut + stickerPrice * 110);

  const percent = Math.round(stickerPrice > steamOut ? 0 : Math.round(mean / ((steamOut + stickerPrice * 100) / 100) - 100)) || 0;

  commonItem.price = {
    steam: {
      // eslint-disable-next-line camelcase
      percent,
      mean,
      safe,
      base: steamOut,
    },
  };
  commonItem.tradable = item.tradable;
  commonItem.visible = true;
  if (commonItem.tradable) {
    commonItem.tradeBan = null;
  }

  await commonItem.save();
  return true;
};

module.exports = async (steamid, items) => {
  const promiseArr = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    promiseArr.push(saveItem(steamid, item));
  }

  await Promise.all(promiseArr);
  await CommonItem.deleteMany({ steamid, assetid: { $nin: items.map(it => it.assetid) } });
};
