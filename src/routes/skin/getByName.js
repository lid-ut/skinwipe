const UserSteamItems = require('../../models/UserSteamItems');
const User = require('../../models/User');

module.exports = async function process(req) {
  const inventories = await UserSteamItems.find(
    {
      'steamItems.name': decodeURIComponent(req.params.name),
    },
    { steamId: 1 },
  ).lean();
  const users = await User.find({ steamId: { $in: inventories.map(it => it.steamId) } }, { avatarmedium: 1 })
    .limit(4)
    .lean();
  return { status: 'success', result: { avatars: users.map(it => it.avatarmedium), count: inventories.length } };
};
