const BotSteam = require('../../models/BotSteam');
const MarketTrade = require('../../models/MarketTrade');
const MarketItem = require('../../models/MarketItem');
const UserSteamItems = require('../../models/UserSteamItems');
const generateUnicCode = require('../../helpers/generateUnicCode');
const getUserMarketItems = require('../../modules/market/items/getUserItems');
const getNameAndTag = require('../../helpers/getNameAndTag');
const changeMoney = require('../../helpers/changeMoney');
const sumMoneyTransactions = require('../../helpers/sumMoneyTransactions');

const createTrade = async (user, tier) => {
  const bot = await BotSteam.findOne({
    $or: [{ tier: tier.index }, { tier: -1 }],
    active: true,
  }).sort({ tier: 1, lastTradeSend: 1 });
  if (!bot) {
    return null;
  }

  bot.lastTradeSend = new Date();
  await bot.save();
  const trade = new MarketTrade({
    code: `${bot.register}_${generateUnicCode.get()}`,
    type: 'bot',
    virtual: tier.type === 'virtual',
    direction: 'in',
    buyer: user.steamId,
    seller: bot.steamid,
    tradeUrl: bot.tradeUrl,
    status: tier.type === 'virtual' ? 'done' : 'wait',
    items: tier.items,
    itemsPartner: [],
  });

  if (trade.virtual) {
    let sum = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const item of tier.items) {
      // eslint-disable-next-line no-await-in-loop
      await MarketItem.deleteOne({ assetid: item.assetid });
      sum += item.price.steam.mean;
    }

    await changeMoney(user, 'sell_market_bot_virtual', 'out', 'done', trade._id, sum);

    await sumMoneyTransactions(user);
  }
  await trade.save();
  return trade;
};

module.exports = async function sellItems(req, res) {
  if (req.user.bans && !!req.user.bans.TRADEBAN) {
    res.json({
      status: 'error',
      code: 1,
      message: 'trade ban',
    });
    return;
  }

  const inventory = await UserSteamItems.distinct('steamItems', { steamId: req.user.steamId }).lean();

  let itemsVirtual = await MarketItem.find({
    reserver: req.user.steamId,
    virtual: true,
    assetid: { $in: req.body.items.map(it => it.assetid) },
  }).lean();

  itemsVirtual = await getUserMarketItems(req.user, itemsVirtual);
  if (itemsVirtual.filter(it => it.withdrawn).length > 0) {
    res.json({
      status: 'error',
      code: 5,
      message: 'items already withdraw',
    });
    return;
  }

  let items = [];
  const realItems = req.body.items.filter(it => itemsVirtual.map(item => item.assetid).indexOf(it.assetid) === -1);
  // eslint-disable-next-line no-restricted-syntax
  for (const reqItem of realItems) {
    const dbItem = inventory.filter(it => it.assetid === reqItem.assetid)[0];
    if (!dbItem) {
      res.json({
        status: 'error',
        code: 1,
        message: 'not found item',
      });
      return;
    }
    if (!dbItem.tradable) {
      res.json({
        status: 'error',
        code: 2,
        message: 'item not tradable',
      });
      return;
    }

    const fullName = `${dbItem.name}`;
    dbItem.steamId = req.user.steamId;
    dbItem.amount = parseInt(dbItem.amount || 1, 10);
    if (dbItem.float === null || dbItem.float === undefined || dbItem.float === 'wait...') {
      dbItem.float = 'unavailable';
    }
    dbItem.paintWear = dbItem.float === 'unavailable' ? null : parseFloat(dbItem.float.substr(0, 10));
    dbItem.float = dbItem.float === 'unavailable' ? null : dbItem.float.substr(0, 10);
    dbItem.name = getNameAndTag(dbItem).name;
    dbItem.ExteriorMin = getNameAndTag(dbItem).tag;
    dbItem.fullName = fullName;

    items.push(dbItem);
  }
  items = await getUserMarketItems(req.user, items);

  const reservedItems = await MarketItem.countDocuments({
    reserver: { $ne: null },
    assetid: { $in: items.map(it => it.assetid) },
  });
  if (reservedItems > 0) {
    res.json({
      status: 'error',
      code: 4,
      message: 'you have not closed trades for items',
    });
    return;
  }
  await MarketItem.deleteMany({ reserver: null, assetid: { $in: items.map(it => it.assetid) } });

  const tiers = [
    {
      index: 0,
      items: [],
      from: 2000,
      to: 100000000,
    },
    {
      index: 1,
      items: [],
      from: 500,
      to: 2000,
    },
    {
      index: 2,
      items: [],
      from: 0,
      to: 500,
    },
    // {
    //   index: 4,
    //   type: 'virtual',
    //   items: itemsVirtual,
    // },
  ];

  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    let doubleCount = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const itemCheck of items) {
      if (itemCheck.assetid === item.assetid) {
        doubleCount++;
      }
    }
    if (doubleCount > 1) {
      res.json({
        status: 'error',
        code: 5,
        message: 'items duplicated',
      });
      return;
    }

    const tier = tiers.filter(it => item.price.steam.mean < it.to && item.price.steam.mean >= it.from)[0];
    if (!tier) {
      console.log(`no tier ${item.price.steam.mean}`);
    }
    tier.items.push(item);
  }

  // let amount = 0;
  let trades = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const tier of tiers) {
    if (tier.items.length > 0) {
      // eslint-disable-next-line no-await-in-loop
      trades.push(await createTrade(req.user, tier));
    }
  }

  trades = trades.filter(it => !!it && !it.virtual);

  res.json({
    status: 'success',
    result: trades,
  });
};
