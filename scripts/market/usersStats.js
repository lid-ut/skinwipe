const fs = require('fs');
require('../../logger');
const MarketTrade = require('../../src/models/MarketTrade');

let fun = async () => {
  const trades = await MarketTrade.find({ status: 'done' });

  let text = 'Имя;цена;качество;float;оружие;тип;';

  for (const trade of trades) {
    for (const item of trade.itemsPartner) {
      let sum = 0;

      text += `${item.name};${item.price.steam.mean};${sum};${item.Rarity};${item.float};${item.Weapon};${item.Type}\n`;
      // let skin = skins.filter(it=>it.name===item.name)[0];
      // if (!skin) {
      //   skins.push({
      //     name: item.name,
      //     count: 1,
      //     minPrice: item.price.steam.mean,
      //     maxPrice: item.price.steam.mean,
      //     avgPrice: item.price.steam.mean,
      //   });
      // }
      //
    }
  }

  fs.writeFile('log.txt', text, function (err) {
    if (err) throw err;
    console.log("It's saved!");
  }); // => message.txt erased, contains only 'Hello Node'
  console.log('done');
};

fun();
