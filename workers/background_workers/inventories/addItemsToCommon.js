const UserSteamItems = require('../../../src/models/UserSteamItems');
const saveItemsToCommon = require('../../../src/modules/market/items/common/saveItems');

module.exports = async () => {
  return new Promise(res => {
    console.log('start common items save');
    const start = Date.now();
    UserSteamItems.find({ appId: '730' })
      .sort({ lastCommonSave: 1 })
      .limit(500)
      .cursor()
      .eachAsync(
        async inv => {
          await saveItemsToCommon(
            inv.steamId,
            inv.steamItems.filter(it => it.tradable),
          );
          await UserSteamItems.updateOne({ _id: inv._id }, { $set: { lastCommonSave: Date.now() } });
        },
        { parallel: 20 },
      )
      .then(() => {
        console.log(`End common items save ${(Date.now() - start) / 1000} sec`);
        res();
      });
  });
};
