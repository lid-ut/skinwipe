const SteamItem = require('../../../src/models/SteamItem');
const UserSteamItems = require('../../../src/models/UserSteamItems');
const MarketPrices = require('../../../src/models/MarketPrices');

async function saveItem(market_hash_name, steamPrices) {
  let superItem = await SteamItem.findOne({
    market_hash_name,
  });
  if (!superItem) {
    superItem = new SteamItem({
      market_hash_name,
      market_name: market_hash_name,
    });
  }

  let userItem = await UserSteamItems.findOne({ 'steamItems.name': superItem.market_hash_name });

  if (!userItem || !userItem.steamItems || !userItem.steamItems.length) {
    return;
  }
  userItem = userItem.steamItems.find(it => it.name === superItem.market_hash_name);
  if (!userItem) {
    return;
  }

  superItem.appid = userItem.appid;
  superItem.usersCount = await UserSteamItems.countDocuments({
    steamItems: {
      $elemMatch: {
        name: market_hash_name,
        tradable: true,
      },
    },
  });

  superItem.classid = userItem.classid;

  const steamPrice = steamPrices.find(price => {
    return price.name === market_hash_name;
  });

  superItem.prices = {
    mean: steamPrice ? steamPrice.prices.steam_in : 0,
    safe: steamPrice ? steamPrice.prices.steam_in : 0,
  };

  superItem.image = userItem.image_large;
  superItem.classid = userItem.classid;

  superItem.Quality = userItem.Quality;
  superItem.QualityName = userItem.QualityName;
  superItem.QualityColor = userItem.QualityColor;
  superItem.Rarity = userItem.Rarity;
  superItem.RarityName = userItem.RarityName;
  superItem.RarityColor = userItem.RarityColor;
  superItem.Type = userItem.Type;
  superItem.Slot = userItem.Slot;
  superItem.Hero = userItem.Hero;
  superItem.Weapon = userItem.Weapon;
  superItem.ItemSet = userItem.ItemSet;
  superItem.ItemSetName = userItem.ItemSetName;
  superItem.Exterior = userItem.Exterior;
  superItem.steamcat = userItem.steamcat;
  superItem.itemclass = userItem.itemclass;
  superItem.Game = userItem.Game;
  superItem.GameName = userItem.GameName;
  superItem.droprate = userItem.droprate;
  superItem.droprateName = userItem.droprateName;
  superItem.item_class = userItem.item_class;
  superItem.item_className = userItem.item_className;

  await superItem.save();
}

module.exports = async () => {
  const names = await UserSteamItems.distinct('steamItems.name');
  const steamPrices = await MarketPrices.find({});
  // eslint-disable-next-line no-restricted-syntax
  for (const name of names) {
    // eslint-disable-next-line no-await-in-loop
    await saveItem(name, steamPrices);
  }
};
