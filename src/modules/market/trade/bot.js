const createMarketTradeBuy = require('./buy');
const Settings = require('../../../models/Settings');

module.exports = async (user, items, send = false) => {
  const settings = await Settings.findOne();
  const botGroup = [];

  if (user.subscriber) {
    for (let i = 0; i < items.length; i++) {
      items[i].price.steam.mean = Math.round(items[i].price.steam.mean - (items[i].price.steam.mean / 100) * settings.market.discount);
      items[i].price.steam.safe = items[i].price.steam.mean;
    }
  }

  const realItems = items.filter(it => it.tradable);
  const virtualItems = items.filter(it => !it.tradable);

  // eslint-disable-next-line no-restricted-syntax
  for (const item of realItems) {
    const group = botGroup.filter(it => it.steamId === item.steamid && !it.virtual)[0];
    if (group) {
      group.items.push(item);
    } else {
      botGroup.push({
        virtual: false,
        steamId: item.steamid,
        items: [item],
      });
    }
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const item of virtualItems) {
    const group = botGroup.filter(it => it.steamId === item.steamid && it.virtual)[0];
    if (group) {
      group.items.push(item);
    } else {
      botGroup.push({
        virtual: true,
        steamId: item.steamid,
        items: [item],
      });
    }
  }

  const trades = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const group of botGroup) {
    // eslint-disable-next-line no-await-in-loop
    trades.push(await createMarketTradeBuy(user, group.items, 'bot', group.virtual, send));
  }
  return trades;
};
