require('../logger');
const fetch = require('node-fetch');

(async () => {
  let itemsPrices = [];
  try {
    let itemsPricesRes = await fetch('http://localhost:3033/api/skins/prices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        steamItems: [
          {
            name: 'AK-47 | Uncharted (Field-Tested)',
            assetid: '123123',
            weapon: 'AK-47',
            rare: 'mil-spec grade',
            stickers: [
              {
                name: 'Sticker | Renegades | Berlin 2019',
                wear: null,
                position: 0,
              },
              {
                name: 'Sticker | Avangar | Berlin 2019',
                wear: 0.1231321,
                position: 2,
              },
              {
                name: 'Sticker | Natus Vincere | Katowice 2019',
                wear: 0.0131321,
                position: 2,
              },
              {
                name: 'Sticker | n0rb3r7 | Katowice 2019',
                wear: 0.8231321,
                position: 3,
              },
            ],
          },
        ],
      }),
    });
    itemsPricesRes = await itemsPricesRes.json();
    itemsPrices = itemsPricesRes.prices || [];
    console.log(itemsPrices);
  } catch (e) {
    console.log(`[updateBotsInventory] ${e.toString()}`);
  }
})();
