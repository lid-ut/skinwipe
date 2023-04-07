const MarketItem = require('../../../models/MarketItem');
// const UserSteamItems = require('../../../models/UserSteamItems');

module.exports = async () => {
  const items = await MarketItem.find(
    {},
    {
      _id: 1,
      name: 1,
      stickers: 1,
      'price.steam.base': 1,
    },
  ).sort({
    name: -1,
    'price.steam.mean': 1,
  });

  const ids = [];
  const idsVisible = [];

  let preName = '';
  let strick = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    if (item.name.toLowerCase().indexOf('sticker') !== -1 && item.price.steam.base < 50) {
      ids.push(item._id);
      // eslint-disable-next-line no-continue
      continue;
    }

    if (item.name === preName) {
      strick++;
    } else {
      strick = 0;
    }

    preName = item.name;

    if (strick >= 1) {
      if (item.name.toLowerCase().indexOf('sticker') !== -1) ids.push(item._id);
      if (item.name.toLowerCase().indexOf('graffiti') !== -1) ids.push(item._id);
      if (item.name.toLowerCase().indexOf('souvenir') !== -1) ids.push(item._id);
      if (item.stickers.length === 0) {
        ids.push(item._id);
      }
    } else {
      idsVisible.push(item._id);
    }
  }
  await MarketItem.updateMany({ _id: { $in: ids } }, { $set: { visible: false } });
  await MarketItem.updateMany({ _id: { $in: idsVisible } }, { $set: { visible: true } });
};
