require('../logger');
const User = require('../src/models/User');
const BotSteam = require('../src/models/BotSteam');
const BotSteamItem = require('../src/models/BotSteamItem');
const changeMoney = require('../src/helpers/changeMoney');
const sumMoneyTransactions = require('../src/helpers/sumMoneyTransactions');

(async () => {
  const bannedBots = await BotSteam.find({
    // ban: true
  });
  const items = await BotSteamItem.find({ virtual: true, steamid: bannedBots.map(it => it.steamid), buyer: { $ne: null } });

  let itemsCount = 0;
  let itemsSum = 0;
  for (const item of items) {
    let count = item.price.steam.base;
    itemsCount++;
    itemsSum += item.price.steam.base;
    const buyer = await User.findOne({ steamId: item.buyer });

    item.visible = false;
    await item.save();
    // await changeMoney(buyer, 'done', item._id, count, { title: `Пополнение на ${count}`, type: 'return', from: 'support' });
    await sumMoneyTransactions(buyer);
  }

  console.log('done');
  console.log(itemsCount);
  console.log(itemsSum);
})();
