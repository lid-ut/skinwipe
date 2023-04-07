const MarketItem = require('../../../models/MarketItem');
const MarketPrices = require('../../../models/MarketPrices');
const Settings = require('../../../models/Settings');
const setStickerPrice = require('./setStickerPrice');

module.exports = async (user, item, type) => {
  const marketPrice = await MarketPrices.findOne({ name: item.name });
  const setting = await Settings.findOne({});

  let marketItem = await MarketItem.findOne({ assetid: item.assetid });
  if (!marketItem) {
    if (!setting.market.server.newBotItems) {
      return false;
    }
    const marketObject = {
      ...item,
      type,
      visible: true,
      steamid: user.steamId || user.steamid,
    };
    marketItem = new MarketItem(marketObject);
  }

  const out = marketPrice ? marketPrice.prices.out * 100 || 0 : 0;
  // eslint-disable-next-line camelcase
  const steamOut = marketPrice ? marketPrice.prices.steam_out * 100 || 0 : 0;
  // let discount = 0.05;
  // if (out > 50) {
  //   discount = 0.01;
  // }
  // const mean = Math.round((out - out * discount) * 100);
  // const safe = Math.round((out - out * discount) * 100);
  const stickerPrice = await setStickerPrice(item);
  marketItem.stickers = item.stickers;
  const mean = Math.round(out + stickerPrice * 110);
  const safe = Math.round(out + stickerPrice * 110);

  const percent = stickerPrice > out ? 0 : Math.round((out * 100) / steamOut - 100);

  marketItem.price = {
    steam: {
      // eslint-disable-next-line camelcase
      percent,
      mean,
      safe,
      base: steamOut,
    },
  };
  marketItem.tradable = item.tradable;
  marketItem.visible = true;
  if (marketItem.tradable) {
    marketItem.tradeBan = null;
  }

  await marketItem.save();
  return true;
};
