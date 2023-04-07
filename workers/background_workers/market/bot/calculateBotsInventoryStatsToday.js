const BotsSteam = require('../../../../src/models/BotSteam');
const BotSteamItem = require('../../../../src/models/BotSteamItem');
const MarketPrices = require('../../../../src/models/MarketPrices');
const User = require('../../../../src/models/User');
const TodayBotsInventoryStat = require('../../../../src/models/TodayBotsInventoryStat');

module.exports = async () => {
  logger.info('[calculateBotsInventoryStatsToday] started');

  const tdBotsStats = new TodayBotsInventoryStat({
    sum: 0,
    sumVirtual: 0,
    bots: [],
  });
  const bots = await BotsSteam.find();

  let sumItemsAll = 0;
  let sumVirtualItemsAll = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const bot of bots) {
    // eslint-disable-next-line no-await-in-loop
    const items = await BotSteamItem.find({ steamid: bot.steamid });
    // eslint-disable-next-line no-await-in-loop
    const prices = await MarketPrices.find({ name: { $in: items.map(it => it.name) } });
    let sumItems = 0;
    let sumVirtualItems = 0;

    // eslint-disable-next-line no-restricted-syntax
    for (const item of items) {
      const price = prices.filter(it => it.name === item.name)[0];
      item.price = {
        steam: {
          mean: price ? price.prices.out : item.price.steam.mean || 0,
        },
      };
      if (item.virtual) {
        sumVirtualItems += item.price.steam.mean;
        sumVirtualItemsAll += item.price.steam.mean;
      } else {
        sumItems += item.price.steam.mean;
        sumItemsAll += item.price.steam.mean;
      }
    }

    tdBotsStats.bots.push({
      name: bot.name,
      steamId: bot.steamid,
      sum: sumItems,
      sumVirtual: sumVirtualItems,
    });
  }
  tdBotsStats.sum = sumItemsAll;
  tdBotsStats.sumVirtual = sumVirtualItemsAll;

  const balances = await User.find(
    {
      money: { $gt: 0 },
      // steamId: { $nin: ['76561198116084988', '76561198096627079', '76561198114352036'] },
    },
    { money: 1 },
  );
  let balance = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const balanceCur of balances) {
    balance += balanceCur.money;
  }
  tdBotsStats.usersBalance = Math.round(balance);
  await tdBotsStats.save();
};
