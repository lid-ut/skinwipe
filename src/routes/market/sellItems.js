const UserSteamItems = require('../../models/UserSteamItems');
const MoneyTransaction = require('../../models/MoneyTransaction');
const User = require('../../models/User');
const sellMarketItem = require('../../modules/market/items/sell');
const checkApiKey = require('../../modules/steam/checkApiKey');

module.exports = async (req, res) => {
  if (req.user.bans && !!req.user.bans.TRADEBAN) {
    res.json({
      status: 'error',
      code: 1,
      message: 'trade ban',
    });
    return;
  }

  if (!req.user.apiKey) {
    res.json({
      status: 'error',
      code: 1,
      message: 'trade ban',
    });
    return;
  }

  const result = await checkApiKey(req.user.apiKey);
  if (!result) {
    res.json({
      status: 'error',
      code: 3,
      message: 'trade ban',
    });
    return;
  }

  const inventory = await UserSteamItems.distinct('steamItems', { steamId: req.user.steamId }).lean();
  // eslint-disable-next-line no-restricted-syntax
  for (const reqItem of req.body.items) {
    const dbItem = inventory.filter(it => it.assetid === reqItem.assetid)[0];
    if (!dbItem) {
      res.json({
        status: 'error',
        code: 1,
        message: 'not found item',
      });
      return;
    }

    if (!dbItem.tradeBan || dbItem.tradeBan < new Date()) {
      dbItem.tradable = true;
    }
    if (!dbItem.tradable) {
      res.json({
        status: 'error',
        code: 1,
        message: 'item not tradable',
      });
      return;
    }
    // eslint-disable-next-line no-await-in-loop
    await sellMarketItem(req.user, dbItem, reqItem.price, 'user');
  }

  res.json({
    status: 'success',
  });
};
