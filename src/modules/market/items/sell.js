const MarketItem = require('../../../models/MarketItem');
const MarketPrices = require('../../../models/MarketPrices');

module.exports = async (user, item, price, type) => {
  let maxPrice = price * (user.subscriber ? 8 : 4);
  const marketPrice = await MarketPrices.findOne({ name: item.name });

  if (item.stickers && item.stickers.length > 0) {
    maxPrice *= 3;
    if (
      item.stickers.filter(it => {
        if (it.name) {
          return (
            it.name.indexOf('Katowice 2014') !== -1 ||
            it.name.indexOf('Cologne 2015') !== -1 ||
            it.name.indexOf('DreamHack 2014') !== -1 ||
            it.name.indexOf('Katowice 2015') !== -1 ||
            it.name.indexOf('Katowice 2019') !== -1
          );
        }
        return false;
      }).length > 0
    ) {
      maxPrice *= 10;
    }
  }

  if (price > maxPrice) {
    return false;
  }

  let marketItem = await MarketItem.findOne({ assetid: item.assetid });

  if (marketItem && marketItem.changePriceDate && marketItem.changePriceDate > new Date(Date.now() - 10 * 60 * 1000)) {
    return false;
  }

  if (!marketItem) {
    const marketObject = {
      ...item,
      paintWear: parseFloat(item.float) || 0,
      paintseed: item.paintseed,
      type,
      userReg: user.createdAt,
      visible: true,
      steamid: user.steamId || user.steamid,
    };
    marketItem = new MarketItem(marketObject);
  }

  marketItem.price = {
    steam: {
      percent: Math.round(price / marketPrice.prices.steam_out - 100),
      mean: price,
      safe: price,
      base: marketPrice ? marketPrice.prices.steam_out * 100 : 0,
    },
  };

  marketItem.tradable = item.tradable;
  marketItem.visible = true;
  if (marketItem.tradable) {
    marketItem.tradeBan = null;
  }
  marketItem.changePriceDate = new Date();
  await marketItem.save();
  return true;
};
