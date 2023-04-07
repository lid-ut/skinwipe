const User = require('../../../src/models/User');

module.exports = async callback => {
  await User.updateMany(
    { lastSteamItemsUpdateInProgress: true },
    {
      $set: {
        lastSteamItemsUpdateInProgress: false,
        steamItemsUpdateTries: 0,
        steamItemsUpdateCount: 0,
      },
    },
  );
  callback();
};
