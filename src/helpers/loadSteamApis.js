const fetch = require('node-fetch');
const config = require('../../config');

function fillAsset(asset, steamId) {
  if (!asset.description || !(asset.description instanceof Object)) {
    asset.description = {};
  }
  if (!asset.description.tags) {
    asset.description.tags = [];
  }

  if (!asset.description.icon_url_large || !asset.description.icon_url_large.length) {
    asset.description.icon_url_large = asset.description.icon_url;
  }

  const assetDB = {
    price: asset.price,
    steamid: steamId,
    appid: asset.appid,
    amount: asset.amount,
    assetid: asset.assetid,
    action: asset.action,
    classid: asset.classid,
    contextid: `${asset.contextid || 2}`,
    instanceid: asset.instanceid,
    marketable: !!asset.description.marketable,
    tradable: !!asset.description.tradable,
    market_tradable_restriction: asset.description.market_tradable_restriction,
    name: asset.description.market_hash_name,
    fullName: asset.description.market_hash_name,
    cache_expiration: asset.description.cache_expiration,
    image_small: asset.description.icon_url,
    image_large: asset.description.icon_url_large,
  };

  if (
    asset.description.market_hash_name === '753-Gems' ||
    asset.description.market_hash_name === '753-Sack of Gems' ||
    asset.description.market_hash_name.indexOf('Autographed') > -1 ||
    asset.description.market_hash_name.indexOf('Souvenir') > -1 ||
    asset.description.market_hash_name.indexOf('Loading Screen') > -1 ||
    asset.description.market_hash_name.indexOf("Artificer's Hammer") > -1 ||
    asset.description.market_hash_name.indexOf("Artificer's Chisel") > -1 ||
    (asset.price && asset.price.steam && asset.price.steam.mean && asset.price.steam.mean === 3)
  ) {
    assetDB.tradable = false;
    assetDB.price = {
      steam: {
        mean: 1,
        safe: 1,
      },
    };
  }

  if (asset.description.actions && asset.description.actions.length > 0) {
    const link = asset.description.actions[0].link || '';
    assetDB.action = link.substr(link.indexOf('assetid%D') + 9);
  }

  if (asset.description.descriptions && asset.description.descriptions.length) {
    let descr = asset.description.descriptions[asset.description.descriptions.length - 1].value;
    if (descr.toLowerCase().indexOf('sticker') > -1) {
      descr = descr.replace("Don't Worry, I'm Pro", "Don't Worry I'm Pro");
      descr = descr.replace('Baaa-ckstabber!', 'Baaa-ckstabber');
      assetDB.stickerPics = descr.match(new RegExp(/https:\/\/[a-z-_./\d]*/gm));
      assetDB.stickerNames = descr.match(new RegExp(/Sticker:\s[a-zA-Z\-.,@\s|\d()_']*/m));
      if (assetDB.stickerNames) {
        assetDB.stickerNames = assetDB.stickerNames[0].replace('Sticker: ', '').split(', ');
      } else {
        assetDB.stickerNames = descr.match(new RegExp(/Patch:\s[a-zA-Z\-.,@\s|\d()_']*/m));
        if (assetDB.stickerNames) {
          assetDB.stickerNames = assetDB.stickerNames[0].replace('Patch: ', '').split(', ');
        }
      }
    }
    if (
      asset.appid === 570 &&
      descr.toLowerCase().indexOf('<span style="font-size: 18px; white-space: normal; color: rgb(255, 255, 255)">') > -1
    ) {
      assetDB.runePics = descr.match(new RegExp(/url\([:a-z-_./\d]*/gm));
      assetDB.runeNames = descr.match(
        new RegExp(/span style="font-size: 18px; white-space: normal; color: rgb\(255, 255, 255\)">[:a-zA-Z\-.,@\s|\d()_']*/gm),
      );
      assetDB.runeTypes = descr.match(new RegExp(/span style="font-size: 12px">[:a-zA-Z\-.,@\s|\d()_']*/gm));
      if (assetDB.runePics) {
        assetDB.runePics = assetDB.runePics.map(rp => rp.replace('url(', ''));
      }
      if (assetDB.runeNames) {
        assetDB.runeNames = assetDB.runeNames.map(rp =>
          rp.replace('span style="font-size: 18px; white-space: normal; color: rgb(255, 255, 255)">', ''),
        );
      }
      if (assetDB.runeTypes) {
        assetDB.runeTypes = assetDB.runeTypes.map(rp => rp.replace('span style="font-size: 12px">', ''));
      }
    }
  }

  if (asset.description.fraudwarnings && asset.description.fraudwarnings.length) {
    const descr = asset.description.fraudwarnings[0];
    if (descr.toLowerCase().indexOf('name tag') > -1) {
      assetDB.nameTag = descr.replace('Name Tag: ', '').replace(/''/g, '');
    }
  }

  asset.description.tags.forEach(tag => {
    assetDB[tag.category] = `${tag.localized_tag_name}`.toLowerCase();
    assetDB[`${tag.category}Name`] = `${tag.localized_category_name}`.toLowerCase();
    if (tag.color) {
      assetDB[`${tag.category}Color`] = tag.color;
    }
  });
  return assetDB;
}

async function getSteamItems(steamid, data) {
  if (!data.appID) {
    if (!data.assets || !data.assets.length) {
      return [];
    }
    data.appID = data.assets[0].appid.toString();
  }
  if (!data.assets) data.assets = [];
  if (!data.descriptions) data.descriptions = [];

  data.assets = data.assets.map(asset => {
    asset.description = data.descriptions.filter(d => d.classid === asset.classid)[0] || {};
    return asset;
  });

  const steamItems = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const asset of data.assets) {
    if (asset.description.actions && asset.description.actions.length > 0 && data.appID === '730') {
      const link = asset.description.actions[0].link || '';
      // eslint-disable-next-line no-unused-vars
      asset.action = link.substr(link.indexOf('assetid%D') + 9);
    }
    steamItems.push(fillAsset(asset, steamid));
  }
  return steamItems;
}

async function processResult(result) {
  if (!result) {
    return { error: 'noResult' };
  }
  if (result.status !== 200) {
    if (result.status === 403) {
      //
      // profile is hidden
      return { error: 'hidden' };
    }
    console.error(`[loadSteamApis][steam] request ban reached? Status: ${result.status}`);
    return { error: 'requestBan' };
  }
  // eslint-disable-next-line no-await-in-loop
  const text = await result.text();
  if (text.indexOf('{') !== 0) {
    if (text.indexOf('Access Denied') > -1) {
      console.error(`[loadSteamApis][steam] request ban reached!`);
      return { error: 'requestBan' };
    }
    if (text.indexOf('The site is currently unavailable') > -1) {
      console.error(`[loadSteamApis][steam] Steam is currently unavailable!`);
      return { error: 'requestBan' };
    }
    if (text === 'null') {
      return { error: 'hidden' };
    }
    if (text === '"null"') {
      return { error: 'hidden' };
    }
    console.error(`[loadSteamApis][steam] result text: ${text}`);
    return { error: 'json' };
  }
  result = JSON.parse(text);
  return result;
}

const getInventoryLegacy = async steamId => {
  const url = `https://api.steamapis.com/steam/inventory/${steamId}/730/2?api_key=${config.steamapistoken}&legacy=1`;
  let result = await fetch(url, { timeout: 25000 }).catch(e => {
    return e.toString();
  });
  if (result.status === 403) {
    return { json: 'null', status: 403 };
  }
  if (result.status !== 200) {
    return { json: { error: 'requestBan' }, status: 500 };
  }
  const text = await result.text();

  if (text.indexOf('{') !== 0) {
    return { json: text, status: 500 };
  }
  result = JSON.parse(text);
  let json = {};
  if (!result.success) {
    return { json: { error: 'hidden' }, status: 500 };
  }
  if (result) {
    const assets = [];
    // tslint:disable-next-line:forin
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const assetid in result.rgInventory) {
      const item = result.rgInventory[assetid];
      assets.push({
        amount: item.amount,
        appid: 730,
        assetid,
        classid: item.classid,
        contextid: 2,
        instanceid: item.instanceid,
      });
    }

    const descriptions = [];
    // tslint:disable-next-line:forin
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const id in result.rgDescriptions) {
      const item = result.rgDescriptions[id];
      descriptions.push({
        actions: item.actions,
        fraudwarnings: item.fraudwarnings,
        appid: parseInt(item.appid, 10),
        background_color: item.background_color,
        cache_expiration: item.cache_expiration,
        classid: item.classid,
        commodity: item.commodity,
        currency: 0,
        descriptions: item.descriptions,
        icon_drag_url: item.icon_drag_url,
        icon_url: item.icon_url,
        icon_url_large: item.icon_url_large,
        instanceid: item.instanceid,
        market_actions: item.market_actions,
        market_hash_name: item.market_hash_name,
        market_name: item.market_name,
        market_tradable_restriction: parseInt(item.market_tradable_restriction, 10),
        marketable: item.marketable,
        name: item.name,
        name_color: item.name_color,
        tags: item.tags.map(it => {
          return {
            category: it.category,
            internal_name: it.internal_name,
            localized_category_name: it.category_name,
            localized_tag_name: it.name,
          };
        }),
        tradable: item.tradable,
        type: item.type,
      });
    }

    json = {
      assets,
      descriptions,
      rwgrsn: -2,
      success: 1,
      total_inventory_count: assets.length,
    };
  }
  return { json, status: 200 };
};

const getInventories = async steamid => {
  const result = [];
  // eslint-disable-next-line no-restricted-syntax,no-unused-vars

  const res = await getInventoryLegacy(steamid);
  // eslint-disable-next-line no-await-in-loop
  result.push(res.json);

  return result;
};

module.exports = async (steamid, appIds) => {
  const inventories = await getInventories(steamid, appIds);

  let items = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const inventory of inventories) {
    if (inventory && !inventory.error) {
      // eslint-disable-next-line no-await-in-loop,no-use-before-define
      items = [...items, ...(await getSteamItems(steamid, inventory))];
    } else if (inventory && inventory.error && inventory.error === 'Failed to get descriptions') {
      console.error(`[loadSteamApis] ${inventory.error} ${steamid} (just restart)`);
      return [];
    } else if (inventory && inventory.error && inventory.error === 'Called method busy, action not taken (10)') {
      console.error(`[loadSteamApis] ${inventory.error} ${steamid} (just restart)`);
      return [];
    } else if (inventory && inventory.error && inventory.error.indexOf('EYldRefreshAppIfNecessary failed') > -1) {
      console.error(`[loadSteamApis] ${inventory.error} ${steamid} (just restart)`);
      return [];
    } else {
      console.error(`[loadSteamApis] [${inventory.error}] ${steamid}`);
      return [];
    }
  }
  return items;
};
