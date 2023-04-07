const fetch = require('node-fetch');

const MarketPrices = require('../../../src/models/MarketPrices');
const MarketItem = require('../../../src/models/MarketItem');
const config = require('../../../config');

const changeCSGOTMCurrency = async cur => {
  try {
    const res = await fetch(`https://market.csgo.com/api/v2/change-currency/${cur}?key=${config.csgotm.baseKey}`);
    await res.json();
  } catch (e) {
    console.log(e);
  }
  return [];
};

const loadCSGOTMItems = async names => {
  try {
    const url = `https://market.csgo.com/api/v2/search-list-items-by-hash-name-all?key=${config.csgotm.baseKey}&
      ${names.map(name => `&list_hash_name[]=${encodeURI(name)}`).join('')}`;
    // console.log(url);
    const res = await fetch(url);

    const data = await res.json();
    if (data.success) {
      return data.data;
    }
  } catch (e) {
    console.log(e);
  }
  return [];
};

const getExterior = name => {
  if (name.indexOf('Battle-Scarred') !== -1) return 'battle-scarred';
  if (name.indexOf('Well-Worn') !== -1) return 'well-worn';
  if (name.indexOf('Field-Tested') !== -1) return 'field-tested';
  if (name.indexOf('Minimal Wear') !== -1) return 'minimal wear';
  if (name.indexOf('Factory New') !== -1) return 'factory new';
  return '';
};

const sellItemCSGOTM = async (item, itemPrice) => {
  let marketItem = await MarketItem.findOne({
    assetid: `${item.id}`,
    type: 'csgotm',
    name: itemPrice.name,
  });

  if (!marketItem) {
    marketItem = new MarketItem({
      type: 'csgotm',
      name: itemPrice.name,
      assetid: `${item.id}`,
      instanceid: `${item.instance}`,
      contextid: 2,
      appid: '730',
      steamid: 'csgotm',
      classid: `${item.class}`,
      float: item.extra.float,
      paintWear: item.extra.float ? parseFloat(item.extra.float) : 0,
      image_small: itemPrice.image.replace('https://steamcommunity-a.akamaihd.net/economy/image/', ''),
      image_large: itemPrice.image.replace('https://steamcommunity-a.akamaihd.net/economy/image/', ''),
      Exterior: getExterior(itemPrice.name),
    });
  }

  let price = item.price * 1.2;
  let base = itemPrice.prices.steam_out * 100;
  if (price < 6) {
    price = 6;
    base = 7;
  }

  marketItem.price = {
    steam: {
      percent: Math.round((price / base) * 100 - 100),
      mean: price,
      safe: price,
      base,
      baseCSGOTM: item.price,
    },
  };
  await marketItem.save();
};

const sellItems = async prices => {
  const itemsList = await loadCSGOTMItems(prices.map(it => it.name));
  // console.log(itemsList);
  const allAssetsAdded = [];
  const promiseArr = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const itemPrice of prices) {
    let items = itemsList[itemPrice.name];
    // eslint-disable-next-line no-continue
    if (!items) continue;

    items = items
      .map(it => {
        it.price = parseInt(it.price, 10) / 10;
        return it;
      })
      .filter(it => {
        return it.price <= itemPrice.prices.csgotm * 105;
      });
    // eslint-disable-next-line no-restricted-syntax
    for (const it of items) {
      allAssetsAdded.push(`${it.id}`);
      promiseArr.push(sellItemCSGOTM(it, itemPrice));
    }
  }
  await Promise.all(promiseArr);
  return allAssetsAdded;
};

const isSkip = name => {
  return name.indexOf('Graffiti') !== -1 || name.indexOf('Sticker') !== -1;
};

module.exports = async () => {
  const date = Date.now();
  const prices = await MarketPrices.find({ 'prices.csgotmPercent': { $lte: -10 } }).lean();

  await changeCSGOTMCurrency('USD');
  console.log(prices.length);

  let allAssetsAdded = [];
  let items = [];
  let i = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const item of prices) {
    if (isSkip(item.name)) {
      // eslint-disable-next-line no-continue
      continue;
    }

    items.push(item);
    i++;
    if (i % 50 === 0 || i === prices.length) {
      // eslint-disable-next-line no-await-in-loop
      const curAssets = await sellItems(items);
      allAssetsAdded = [...allAssetsAdded, ...curAssets];
      items = [];
    }
  }

  await MarketItem.deleteMany({ type: 'csgotm', assetid: { $nin: allAssetsAdded } });

  logger.info(`[sell][csgotm] finished ${(Date.now() - date) / 1000}S`);
};
