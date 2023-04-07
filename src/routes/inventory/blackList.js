const User = require('../../models/User');
const UserSteamItems = require('../../models/UserSteamItems');

module.exports = async function process(req) {
  const items = await UserSteamItems.distinct('steamItems', { steamId: req.user.steamId }).lean();
  if (!items || !items.length) {
    return { status: 'error', code: 0, message: 'no items found' };
  }

  const item = items.find(it => it.assetid === req.body.asset);
  if (!item) {
    return { status: 'error', code: 1, message: 'item not found' };
  }

  if (!req.user.blackListedItems) {
    req.user.blackListedItems = [];
  }
  req.user.blackListedItems = req.user.blackListedItems.filter(bli => bli.assetid !== req.body.asset);
  if (!req.body.clear) {
    req.user.blackListedItems.push({
      appid: item.appid,
      name: item.name,
      assetid: item.assetid,
    });
  }

  await User.updateOne({ steamId: req.user.steamId }, { $set: { blackListedItems: req.user.blackListedItems } });

  return {
    status: 'success',
    result: {
      blackListedItems: (req.user.blackListedItems || []).map(bli => {
        return {
          appid: bli.appid,
          name: bli.name,
          assetid: bli.assetid,
        };
      }),
    },
  };
};
