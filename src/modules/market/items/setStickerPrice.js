const MarketPrices = require('../../../models/MarketPrices');

module.exports = async asset => {
  let percent = 0;
  if (asset.price.steam.mean > 30) percent = 0.5;
  if (asset.price.steam.mean > 50) percent = 1;
  if (asset.price.steam.mean > 70) percent = 2;
  if (asset.price.steam.mean > 100) percent = 3;
  if (asset.price.steam.mean > 500) percent = 4;
  if (asset.price.steam.mean > 1500) percent = 5;
  if (asset.price.steam.mean > 3000) percent = 6;
  if (asset.price.steam.mean > 6000) percent = 7;
  if (asset.price.steam.mean > 10000) percent = 8;

  let stickersPrice = 0;
  const prices = await MarketPrices.find({ name: { $in: asset.stickers.map(it => it.name) } });
  for (let i = 0; i < asset.stickers.length; i++) {
    if (asset.name.toLowerCase().indexOf('souvenir') !== -1) {
      asset.stickers[i].price = 0;
      // eslint-disable-next-line no-continue
      continue;
    }

    const price = prices.find(it => it.name === asset.stickers[i].name);
    if (price) {
      if (!asset.stickers[i].wear) {
        asset.stickers[i].price = Math.round(price.prices.steam_in * percent) / 100;
      } else {
        asset.stickers[i].price = 0;
      }
    } else {
      asset.stickers[i].price = 0;
    }
    stickersPrice += asset.stickers[i].price;
  }

  return stickersPrice;
};
