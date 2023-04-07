const User = require('../models/User');
const UserSteamItems = require('../models/UserSteamItems');

module.exports = async (name, steamId) => {
  const invs = await UserSteamItems.find(
    {
      'steamItems.name': name,
    },
    { steamId: 1, steamItems: { $elemMatch: { name } } },
  )
    .sort({ updatedAt: -1 })
    .limit(100);

  const users = await User.find({ steamId: { $in: invs.map(it => it.steamId) } }, { steamId: 1, blackListedItems: 1 });

  let steamIds = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const inv of invs) {
    // eslint-disable-next-line no-restricted-syntax
    if (inv.steamItems.length > 0) {
      const user = users.filter(it => it.steamId === inv.steamId)[0];
      if (user && user.blackListedItems && user.blackListedItems.length > 0) {
        if (user.blackListedItems.filter(it => it.assetid === inv.steamItems[0].assetid).length > 0) {
          // eslint-disable-next-line no-continue
          continue;
        }
      }
      if (inv.steamItems[0].tradable) {
        steamIds.push(inv.steamId);
      }
    }
  }
  if (steamId) {
    steamIds = steamIds.filter(it => it !== steamId);
  }

  return steamIds;
};
