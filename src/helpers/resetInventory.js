const User = require('../models/User');

module.exports = async function resetInventory(steamId, silent = false) {
  const time = silent ? 777 : 666;
  await User.updateOne({ steamId }, { $set: { lastSteamItemsUpdate: time, steamItemsUpdateTries: 0 } });
  return { error: null, result: 'success' };
};
