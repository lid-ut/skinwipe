const UserSteamItems = require('../models/UserSteamItems');

module.exports = async function deleteUserItems(assetids) {
  const invs = await UserSteamItems.find({ 'steamItems.assetid': { $in: assetids } });
  // eslint-disable-next-line no-restricted-syntax,no-unused-vars
  for (const inv of invs) {
    for (let i = 0; i < inv.steamItems.length; i++) {
      if (assetids.indexOf(inv.steamItems[i].assetid) !== -1) {
        inv.steamItems.splice(i, 1);
      }
    }
    // eslint-disable-next-line no-await-in-loop
    await UserSteamItems.updateOne({ _id: inv._id }, { $set: { steamItems: inv.steamItems } });
  }
};
