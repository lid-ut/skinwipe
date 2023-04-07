require('../logger');
const BotSteamItem = require('../src/models/BotSteamItem');
const BotSteamPrice = require('../src/models/BotSteamPrice');

(async () => {
  const items = await BotSteamItem.find();
  for (const item of items) {
    console.log(item.assetid);
    await BotSteamPrice.updateOne({ assetid: item.assetid }, { $set: { name: item.name } });
  }

  console.log('done');
})();
