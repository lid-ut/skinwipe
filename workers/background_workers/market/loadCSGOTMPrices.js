const fetch = require('node-fetch');
const MarketPrices = require('../../../src/models/MarketPrices');

async function saveItem(appID, item) {
  const itemDB =
    (await MarketPrices.findOne({
      appid: appID,
      name: item.market_hash_name,
    })) ||
    new MarketPrices({
      appid: appID,
      name: item.market_hash_name,
    });

  itemDB.prices.csgotm = parseFloat(item.price);
  if (!itemDB.image) {
    itemDB.prices.steam_in = itemDB.prices.csgotm;
    itemDB.prices.steam_out = itemDB.prices.csgotm;
    itemDB.prices.in = itemDB.prices.csgotm;
    itemDB.prices.out = itemDB.prices.csgotm;

    itemDB.image = `https://cdn.csgo.com//item/${item.market_hash_name}/300.png`;
  }

  itemDB.prices.csgotmPercent = Math.round((itemDB.prices.csgotm / itemDB.prices.steam_out) * 100 - 100);

  if (itemDB.prices.csgotmPercent < -10) {
    await itemDB.save();
  }
  // await updateItemsAfterMarket(itemDB);
}

async function saveItems(appID, items) {
  if (!items || items.length === 0) return;

  const arr = [];
  for (let i = 0; i < items.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    arr.push(saveItem(appID, items[i]));
  }
  await Promise.all(arr);
}

const loadGame = async appid => {
  // const fun = async (cb) => {
  const date = Date.now();
  // logger.info(`[load][csgotm][saveItems] started`);
  const fetchResult = await fetch(`https://market.csgo.com/api/v2/prices/USD.json`).catch(e => {
    logger.error('[load][market] err: %j', e);
  });
  const text = await fetchResult.text();

  if (text.indexOf('{') !== 0) {
    return;
  }
  const result = JSON.parse(text);

  if (result && result.items) {
    await saveItems(appid, result.items);
  }

  logger.info(`[load][csgotm] finished ${(Date.now() - date) / 1000}S`);
};

module.exports = async () => {
  await loadGame(730);
  // await loadGame(570);
};
