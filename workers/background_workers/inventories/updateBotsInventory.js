require('../../../logger');
const Bot = require('../../../src/models/BotSteam');
const Item = require('../../../src/models/BotSteamItem');
const MarketPrices = require('../../../src/models/MarketPrices');
const FloatAssetId = require('../../../src/models/FloatAssetId');
const MarketItem = require('../../../src/models/MarketItem');
const loadSteamApis = require('../../../src/helpers/loadSteamApis');

const getItemsPrices = async steamItems => {
  // eslint-disable-next-line no-restricted-syntax
  return MarketPrices.find({ name: { $in: steamItems.map(it => it.name) } });
};

const getItemsFloats = async items => {
  const floatAssetIds = await FloatAssetId.find({ assetId: { $in: items.map(it => it.assetid) } });
  const floats = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    let floatAsset = floatAssetIds.filter(it => it.assetId === item.assetid)[0];
    if (!floatAsset && item.action && item.action !== '') {
      floatAsset = new FloatAssetId({ float: '0', assetId: item.assetid, steamId: item.steamid, action: item.action });
    }
    floats.push(floatAsset);
  }
  return floats;
};

const addNewItems = async (steamid, items) => {
  const floats = await getItemsFloats(items);

  items = items
    .map(item => {
      let floatRes = {};
      if (item.appid === '730' && item.Type !== 'container' && item.Type !== 'sticker' && item.Type !== 'agent') {
        floatRes = floats.filter(it => (it ? it.assetId === item.assetid : false))[0] || {};
        floatRes = {
          float: floatRes.float,
          paintWear: parseFloat(floatRes.float !== 'unavailable' ? floatRes.float : 0) || 0,
          stickers: (floatRes.stickers || []).map((it, index) => {
            return {
              slot: it.slot,
              wear: it.wear,
              img: item.stickerPics ? item.stickerPics[index] : '',
              name: it.name.indexOf('Sticker |') === -1 ? `Sticker | ${it.name}` : it.name,
            };
          }),
          paintseed: floatRes.paintSeed,
        };
      }

      if (item.cache_expiration) {
        item.tradeBan = new Date(item.cache_expiration);
      }
      return {
        ...item,
        stickers: floatRes.stickers,
        float: floatRes.float,
        paintWear: floatRes.paintWear || 0,
        paintseed: floatRes.paintseed,
      };
    })
    .filter(it => !!it);

  const itemsPrices = await getItemsPrices(items);
  items = items.map(item => {
    const price = itemsPrices.filter(it => it.name === item.name)[0];
    if (item.cache_expiration) {
      item.tradeBan = new Date(item.cache_expiration);
      item.tradable = false;
    }

    if (!price) {
      return null;
    }
    if (item.stickers) {
      item.stickers = item.stickers.map(it => {
        return {
          name: it.name,
          slot: it.slot,
          wear: it.wear,
        };
      });
    }
    const res = {
      ...item,
      price: {
        steam: {
          percent: Math.round((price.prices.out * 100) / price.prices.steam_out - 100),
          mean: price.prices.out * 100,
          safe: price.prices.out * 100,
          base: price ? price.prices.steam_out * 100 : 0,
        },
      },
      priceint: Math.floor(price.prices.out * 100),
    };
    return res;
  });
  // .filter(it => !!it);
  await Item.insertMany(items);
  // eslint-disable-next-line no-restricted-syntax
  for (const float of floats) {
    if (float) {
      // eslint-disable-next-line no-await-in-loop
      await float.save();
    }
  }
  return true;
};

const changePricesForCurrentItems = async (steamid, items, itemsSteam) => {
  const floats = await getItemsFloats(items);
  items = items.map(item => {
    let floatRes = {};
    if (item.appid === '730' && item.Type !== 'container' && item.Type !== 'sticker') {
      floatRes = floats.filter(it => (it ? it.assetId === item.assetid : false))[0] || {};
      floatRes = {
        float: floatRes.float,
        paintWear: parseFloat(floatRes.float !== 'unavailable' ? floatRes.float : 0) || 0,
        stickers: (floatRes.stickers || []).map((it, index) => {
          return {
            slot: it.slot,
            wear: it.wear,
            img: item.stickerPics ? item.stickerPics[index] : '',
            name: it.name.indexOf('Sticker |') === -1 ? `Sticker | ${it.name}` : it.name,
          };
        }),
        paintseed: floatRes.paintSeed,
      };
      item.stickers = floatRes.stickers;
      item.float = floatRes.float;

      item.paintWear = floatRes.paintWear || 0;
      item.paintseed = floatRes.paintseed || 0;
    }
    return item;
  });
  const itemsPrices = await getItemsPrices(items);
  const promiseArr = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    const price = itemsPrices.filter(it => it.assetid === item.assetid)[0];
    const itemSteam = itemsSteam.filter(it => it.assetid === item.assetid)[0];
    if (price && item.stickers) {
      item.stickers = item.stickers.map((it, index) => {
        return {
          name: it.name,
          slot: it.slot,
          wear: it.wear,
          img: item.stickerPics ? item.stickerPics[index] : '',
          price:
            (price.stickers.filter(stickerPriceItem => stickerPriceItem.name === it.name && stickerPriceItem.slot === it.slot)[0] || {})
              .price || 0,
        };
      });
    }

    item.tradable = !!itemSteam.tradable;
    if (itemSteam.cache_expiration) {
      item.tradeBan = new Date(itemSteam.cache_expiration);
      item.tradable = false;
    }

    if (price) {
      item.price = price;
      item.priceInt = Math.floor(price.steam.mean * 100);
    }
    promiseArr.push(
      Item.updateOne(
        { assetid: item.assetid },
        {
          $set: item,
        },
      ),
    );
  }

  return Promise.all(promiseArr);
};

const load = async bot => {
  const items = await loadSteamApis(bot.steamid, [730]);
  const foundItems = await Item.find({ steamid: bot.steamid, assetid: { $in: items.map(it => it.assetid) } });
  const assetids = foundItems.map(it => it.assetid);

  if (assetids.length > 0) {
    await MarketItem.deleteMany({ steamid: bot.steamid, assetid: { $nin: assetids } });
    await Item.deleteMany({ steamid: bot.steamid, assetid: { $nin: assetids } });
  }
  await changePricesForCurrentItems(
    bot.steamid,
    await Item.find({ assetid: { $in: assetids } }).lean(),
    items.filter(it => assetids.indexOf(it.assetid) !== -1),
  );
  await addNewItems(
    bot.steamid,
    items.filter(it => assetids.indexOf(it.assetid) === -1),
  );

  bot.itemsUpdated = true;
  await bot.save();
};

module.exports = async () => {
  // const bots = await Bot.find({ itemsUpdated: false, active: true });
  const bots = await Bot.find({
    itemsUpdated: false,
    active: true,
  });
  if (bots.length === 0) {
    return;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const bot of bots) {
    // eslint-disable-next-line no-await-in-loop
    await load(bot);
  }
};
