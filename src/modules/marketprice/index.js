const MarketItem = require('../../models/MarketItem');
const MarketPrices = require('../../models/MarketPrices');

const getStickerPrice = (price, item, skinPrice) => {
  let percent = 5;
  if (skinPrice < 1) {
    percent = 2;
  }
  const res = (price / 100) * percent;
  // eslint-disable-next-line no-nested-ternary
  return Math.round((res > percent ? percent : res < 0.01 ? 0.01 : res) * 100) / 100;
};

module.exports = async (user, items, mul = 2.6) => {
  let all = items.map(it => it.fullName || it.name);
  let allStickers = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    if (item.stickers) {
      allStickers = allStickers.concat(item.stickers.map(it => it.name) || []);
    }
  }
  all = all.concat(allStickers);
  const prices = await MarketPrices.find({ name: { $in: all } }).lean();
  const sellerPrices = await MarketItem.find({
    steamid: user.steamId,
    assetid: { $in: items.map(it => it.assetid) },
  }).lean();

  const itemsRes = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    const marketPrice = prices.filter(it => it.name === (item.fullName || item.name))[0];
    if (!marketPrice) {
      // eslint-disable-next-line no-continue
      continue;
    }
    let stickerPrice = 0;
    if (item.stickers && item.stickers.length > 0) {
      // eslint-disable-next-line no-restricted-syntax
      for (const sticker of item.stickers) {
        if (!sticker.price) {
          sticker.price = 0;
        }
        const realStickerPrice = Math.round((sticker.price / mul) * 100) / 100;
        if (realStickerPrice > 0) {
          sticker.price = realStickerPrice;
        }

        stickerPrice += sticker.price || 0;
      }
    }

    const price = Math.round(marketPrice.prices.in * 100);
    // const price = Math.round(marketPrice.prices.in * 100);
    const sellerPrice = sellerPrices.filter(it => it.assetid === item.assetid)[0];

    itemsRes.push({
      ...item,
      reserver: sellerPrice ? sellerPrice.reserver : item.reserver,
      price: {
        manual: !!sellerPrice,
        steam: {
          mean: price,
          safe: price,
          manual: sellerPrice ? sellerPrice.price.steam.mean : null,
          base: marketPrice ? marketPrice.prices.steam_out * 100 : price,
        },
      },
    });
  }
  return itemsRes;
};
