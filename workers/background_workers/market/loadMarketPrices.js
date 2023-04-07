const fetch = require('node-fetch');
const MarketPrices = require('../../../src/models/MarketPrices');
const config = require('../../../config');

async function saveItem(appID, item) {
  const itemDB =
    (await MarketPrices.findOne({
      appid: appID,
      name: item.market_hash_name,
    })) || new MarketPrices();

  if (!item.asset_description) {
    item.asset_description = {};
  }

  let newPrice = item.prices.safe;
  const last24h = item.prices.safe_ts.last_24h;
  const mean = item.prices.mean;

  if (mean > 0 && mean < newPrice) {
    newPrice = mean;
  }
  if (last24h > 0 && last24h < newPrice) {
    newPrice = last24h;
  }
  newPrice = Math.floor(newPrice * 100) / 100;

  if (itemDB && itemDB.prices && itemDB.prices.mean === newPrice) {
    return;
  }

  itemDB.appid = appID;
  itemDB.prices.steam_in = newPrice;
  itemDB.prices.steam_out = newPrice;

  itemDB.prices.in = Math.round((newPrice - (newPrice / 100) * 22) * 100) / 100;
  itemDB.prices.out = Math.round((newPrice - (newPrice / 100) * 5) * 100) / 100;

  itemDB.image = item.image ? item.image.replace('community.cloudflare.steamstatic.com', 'steamcommunity-a.akamaihd.net') : '';
  itemDB.name = item.market_hash_name;
  await itemDB.save();
  // await updateItemsAfterMarket(itemDB);
}

async function saveItems(appID, items) {
  if (!items || items.length === 0) return;

  for (let i = 0; i < items.length; i++) {
    const percent = (i * 100) / items.length;
    logger.info(`[loadMarketPrices][saveItems] [${Math.round(percent)}%]`);

    // eslint-disable-next-line no-await-in-loop
    await saveItem(appID, items[i]);
  }
}

const loadGame = async appid => {
  // const fun = async (cb) => {
  logger.info(`[load][market][saveItems] started`);
  console.log(`[load][market] https://api.steamapis.com/market/items/${appid}?api_key=${config.steamapistoken}`);
  const fetchResult = await fetch(`https://api.steamapis.com/market/items/${appid}?api_key=${config.steamapistoken}`).catch(e => {
    logger.error('[load][market] err: %j', e);
  });
  const text = await fetchResult.text();

  if (text.indexOf('{') !== 0) {
    return;
  }
  const result = JSON.parse(text);
  if (result && result.data) {
    await saveItems(appid, result.data);
  }
  logger.info(`[load][market][saveItems] finished`);
};

module.exports = async () => {
  await loadGame(730);
  // await loadGame(570);
};
