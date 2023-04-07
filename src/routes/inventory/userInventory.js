const UserSteamItems = require('../../models/UserSteamItems');
const User = require('../../models/User');
const filterItemsV2 = require('../../helpers/filterItemsV2');
const config = require('../../../config');

module.exports = async function userInventory(req, res) {
  const limit = parseInt(req.params.limit, 10) || 0;
  const offset = parseInt(req.params.offset, 10) || 0;
  const steamId = req.params.steamId || '0';
  const filters = req.body.filters;

  const userItems = await UserSteamItems.find({ steamId }).lean();
  const user = await User.findOne({ steamId }).lean();

  if (!user) {
    res.json({ status: 'error', code: 0, message: 'no user' });
    return;
  }

  let items = await filterItemsV2(user, userItems, filters, offset, limit);
  items = items.result || [];

  for (let i = 0; i < items.length; i++) {
    const gameName = config.steam.games_names[items[i].appid];
    if (req.user.bans && req.user.bans[gameName]) {
      items[i].tradable = false;
    }
    if (user.bans && user.bans[gameName]) {
      items[i].tradable = false;
    }
  }

  if (!user.blackListedItems) {
    user.blackListedItems = [];
  }
  for (let i = 0; i < items.length; i++) {
    if (user.blackListedItems.find(bli => bli.assetid === items[i].assetid)) {
      items[i].tradable = false;
    }
  }

  const result = {
    status: 'success',
    result: {
      items,
      itemsCount: user.allSkinsCount,
    },
  };
  if (redisClient) {
    redisClient.setex(req.redisToken, 30, JSON.stringify(result));
  }
  res.json(result);
};
