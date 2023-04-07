const SteamItem = require('../models/SteamItem');

module.exports = async name => {
  const steamItem = await SteamItem.findOne({ market_hash_name: name }).lean();
  if (!steamItem) {
    return null;
  }

  steamItem.price = {
    steam: {
      mean: steamItem.prices.mean * 100,
      safe: steamItem.prices.mean * 100,
    },
  };
  steamItem.name = steamItem.market_hash_name;
  steamItem.image_large = steamItem.image.replace('https://steamcommunity-a.akamaihd.net/economy/image/', '');
  steamItem.image_small = steamItem.image.replace('https://steamcommunity-a.akamaihd.net/economy/image/', '');
  steamItem.contextid = `${steamItem.contextid || '2'}`;
  steamItem.paintWear = 0;

  return steamItem;
};
