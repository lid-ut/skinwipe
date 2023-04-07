require('../logger');
const fs = require('fs');
const BotSteamTradeHistory = require('../src/models/BotSteamTradeHistory');
const SteamItem = require('../src/models/SteamItem');

(async () => {
  for (let i = 19; i < 21; i++) {
    const bot = `${i}`;
    await new Promise(resolve => {
      fs.readFile(`./itemsHistories/${bot}.json`, { encoding: 'utf-8' }, async function (err, data) {
        if (!err) {
          const json = JSON.parse(data);

          for (const trade of json) {
            const item = await BotSteamTradeHistory.findOne({ tradeCustomId: bot + trade.id });

            if (!item) {
              for (let skin of trade.itemsIn) {
                const price = await SteamItem.findOne({ market_hash_name: skin.name });
                if (price) {
                  skin.price = price.prices.mean * 100;
                }
              }

              for (let skin of trade.itemsOut) {
                const price = await SteamItem.findOne({ market_hash_name: skin.name });
                if (price) {
                  skin.price = price.prices.mean * 100;
                }
              }
              const item = new BotSteamTradeHistory({
                bot,
                tradeCustomId: bot + trade.id,
                itemsIn: trade.itemsIn,
                itemsOut: trade.itemsOut,
              });

              await item.save();
            }
          }

          resolve(true);
        } else {
          console.log(err);
        }
      });
    });
  }

  console.log('done');
})();
