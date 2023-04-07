const fs = require('fs');
require('../../logger');
const MarketItem = require('../../src/models/MarketItem');

let fun = async () => {
  const items = await MarketItem.find({
    steamid: { $in: ['76561199165521056', '76561199173645726'] },
    createdAt: { $gte: new Date(Date.now() - 64 * 24 * 60 * 60 * 1000) },
  });

  let text = 'Имя;цена;куплен\n';

  let sum = 0;
  for (const item of items) {
    sum += item.price.steam.mean;
    text += `${item.name};${(item.price.steam.mean / 100).toString().replace('.', ',')};${!!item.reserver}\n`;
  }
  console.log(sum);

  fs.writeFile('logItem.txt', text, function (err) {
    if (err) throw err;
    console.log("It's saved!");
  }); // => message.txt erased, contains only 'Hello Node'
  console.log('done');
};

fun();
