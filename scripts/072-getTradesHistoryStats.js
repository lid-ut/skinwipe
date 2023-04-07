require('../logger');
const BotSteamTradeHistory = require('../src/models/BotSteamTradeHistory');

const sortItemsByPrice = (a, b) => {
  if (a.price < b.price) {
    return 1;
  }
  if (a.price > b.price) {
    return -1;
  }
  return 0;
};

(async () => {
  const all = await BotSteamTradeHistory.find();

  const skinsIn = [];
  const skinsOut = [];

  let inSum = 0;
  let inCount = 0;
  let outSum = 0;
  let outCount = 0;
  for (const trade of all) {
    for (const skin of trade.itemsIn) {
      if (skin.price) {
        skinsIn.push(skin);
        inSum += skin.price;
        inCount++;
      }
    }
    for (const skin of trade.itemsOut) {
      if (skin.price) {
        skinsOut.push(skin);
        outSum += skin.price;
        outCount++;
      }
    }
  }

  skinsIn.sort(sortItemsByPrice);
  skinsOut.sort(sortItemsByPrice);

  console.log(inCount + ' ' + inSum / 100);
  console.log(outCount + ' ' + outSum / 100);

  console.log('Скинов пришло');
  for (let i = 0; i < 20; i++) {
    console.log(`${skinsIn[i].name} ${skinsIn[i].price / 100}`);
  }
  console.log('Скинов ушло');
  for (let i = 0; i < 20; i++) {
    console.log(`${skinsOut[i].name} ${skinsOut[i].price / 100}`);
  }

  console.log('done');
})();
