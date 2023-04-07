const User = require('../../../src/models/User');
const UserSteamItems = require('../../../src/models/UserSteamItems');
const CommonItem = require('../../../src/models/CommonItem');

module.exports = async callback => {
  const startTime = Date.now();

  const users = await User.find(
    {
      allSkinsCount: { $gt: 0 },
      lastActiveDate: {
        $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    },
    {
      _id: 1,
      steamId: 1,
    },
  )
    .sort({ _id: 1 })
    .lean()
    .exec();

  await User.updateMany(
    {
      allSkinsCount: { $gt: 0 },
      lastActiveDate: {
        $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    },
    {
      $set: {
        allSkinsCount: 0,
        allSkinsPrice: 0,
        // coinCount: 0,
      },
    },
  );

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    // eslint-disable-next-line no-await-in-loop
    await UserSteamItems.deleteMany({
      steamId: user.steamId,
    });

    // eslint-disable-next-line no-await-in-loop
    await CommonItem.deleteMany({
      steamId: user.steamId,
    });
  }

  logger.info(`[deleteOldInventory] end in ${Date.now() - startTime}ms for ${users.length} users`);
  callback();
};
