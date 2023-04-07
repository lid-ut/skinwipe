const User = require('../../../src/models/User');
const loadUsersInventories = require('../../../src/modules/inventory/load');

const updateUserInventory = require('../../../src/modules/inventory/update');

module.exports = async () => {
  // const idleTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // month ago
  const forceTime = new Date(534600000000); // Force 1986!
  const users = await User.find(
    {
      lastActiveDate: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
      lastSteamItemsUpdate: { $lte: forceTime },
      steamItemsUpdateCount: { $lte: 5 },
      lastSteamItemsUpdateInProgress: { $ne: true },
      $or: [{ steamItemsUpdateTries: null }, { steamItemsUpdateTries: { $lt: 4 } }],
    },
    {
      _id: 1,
      personaname: 1,
      steamId: 1,
      lastSteamItemsUpdate: 1,
      steamItemsUpdateTries: 1,
      allSkinsCount: 1,
      locale: 1,
    },
  )
    .sort({ lastActiveDate: -1 })
    .limit(8)
    .lean()
    .exec();

  let start = Date.now();
  const userInventories = await loadUsersInventories(users);
  console.log(`End loading ${(Date.now() - start) / 1000} sec`);
  start = Date.now();
  const arr = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const user of users) {
    // eslint-disable-next-line no-await-in-loop
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          lastSteamItemsUpdate: new Date(),
          lastSteamItemsUpdateInProgress: true,
        },
        $inc: {
          steamItemsUpdateTries: 1,
          steamItemsUpdateCount: 1,
        },
      },
    );
    arr.push(
      updateUserInventory.updateUserItems(
        user,
        userInventories.filter(it => it.steamId === user.steamId),
      ),
    );
  }
  if (arr.length > 0) {
    await Promise.all(arr);
  }

  console.log(`End saving ${(Date.now() - start) / 1000} sec`);
};
