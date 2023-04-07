const getNameAndTag = require('../../../helpers/getNameAndTag');
const getMarketPrices = require('../../marketprice');
const MarketItem = require('../../../models/MarketItem');
const Settings = require('../../../models/Settings');
const MarketUnstable = require('../../../models/MarketUnstable');

const getCount = async name => {
  return MarketItem.countDocuments({ name });
};
const minPrice = async name => {
  const item = await MarketItem.findOne({ name }).sort({ 'price.steam.mean': -1 });
  return item ? item.price.steam.mean : 0;
};

module.exports = async (user, pItems) => {
  const itemsWithPrices = await getMarketPrices(user, pItems);
  const marketUnstable = await MarketUnstable.findOne();
  const settings = await Settings.findOne();

  const items = [];
  // eslint-disable-next-line no-unused-vars,no-restricted-syntax
  for (const item of itemsWithPrices) {
    item.ExteriorMin = getNameAndTag(item).tag;
    // eslint-disable-next-line no-await-in-loop
    const count = await getCount(item.fullName);
    let overstock = false;
    let unstable = false;

    overstock = count >= settings.overstock;
    if (count > 1) {
      item.price.steam.safe = Math.round(item.price.steam.safe * (1 - count / 100 / 2) * 100) / 100;
      item.price.steam.mean = Math.round(item.price.steam.mean * (1 - count / 100 / 2) * 100) / 100;
    }
    // if (item.price.steam.mean < 2) {
    //   item.tradable = false;
    //   unstable = true;
    // }
    if (marketUnstable) {
      if (marketUnstable.collections.indexOf(item.ItemSet) !== -1) {
        item.tradable = false;
        unstable = true;
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const unsName of marketUnstable.names) {
        if (item.name.indexOf(unsName) !== -1) {
          item.tradable = false;
          unstable = true;
        }
      }
    }

    if (item.price.manual) {
      item.price.steam.manual = Math.round(item.price.steam.manual * 100) / 100;
    }

    if (!item.virtual) {
      if (!user.subscriber) {
        item.price.steam.instantSaleSub =
          Math.round((item.price.steam.safe + (item.price.steam.safe / 100) * settings.market.bonus) * 100) / 100;
      } else {
        item.price.steam.instantSaleSub = item.price.steam.safe;
        item.price.steam.safe = Math.round((item.price.steam.safe + (item.price.steam.safe / 100) * settings.market.bonus) * 100) / 100;
        item.price.steam.mean = Math.round((item.price.steam.safe + (item.price.steam.safe / 100) * settings.market.bonus) * 100) / 100;
      }
    }

    if (item.price.steam.base < settings.market.minInstantSkinPrice) {
      item.price.steam.safe = item.price.steam.base;
      item.price.steam.mean = item.price.steam.base;
    }

    if (!item.tradeBan || item.tradeBan < new Date()) {
      item.tradable = true;
    }

    if (item.tradable) {
      item.tradeBan = null;
    }

    let maxPrice = item.price.steam.mean * (user.subscriber ? 5 : 4);
    if (item.stickers && item.stickers.length > 0) {
      maxPrice *= 7;
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
    item.price.steam.max = maxPrice;
    // eslint-disable-next-line no-await-in-loop
    item.price.steam.recommended = Math.round(item.price.steam.base * 0.75);
    // eslint-disable-next-line no-await-in-loop
    item.price.steam.min = Math.round((await minPrice(item.name)) || item.price.steam.base * 0.65);

    items.push({
      ...item,
      steamid: item.userSteamId,
      // eslint-disable-next-line no-await-in-loop
      overstock,
      unstable,
    });
  }
  return items;
};
