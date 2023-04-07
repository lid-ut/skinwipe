const MarketPrices = require('../../models/MarketPrices');
const Auction = require('../../models/Auction');
const FloatAssetId = require('../../models/FloatAssetId');
const UserSteamItems = require('../../models/UserSteamItems');
const UserInventoryUpdate = require('../../models/UserInventoryUpdate');
const Comment = require('../../models/Comment');
const Like = require('../../models/Like');
const MarketItem = require('../../models/MarketItem');
const User = require('../../models/User');
const sendPushV3 = require('../../helpers/sendPushV3');
const i18n = require('../../languages');
const loadUsersInventories = require('./load');

const setStickerPrice = async asset => {
  let percent = 0;
  if (asset.price.steam.mean > 30) {
    percent = 1;
  }
  if (asset.price.steam.mean > 50) {
    percent = 2;
  }
  if (asset.price.steam.mean > 70) {
    percent = 3;
  }
  if (asset.price.steam.mean > 100) {
    percent = 4;
  }
  if (asset.price.steam.mean > 500) {
    percent = 5;
  }
  if (asset.price.steam.mean > 1500) {
    percent = 6;
  }
  if (asset.price.steam.mean > 3000) {
    percent = 7;
  }
  if (asset.price.steam.mean > 6000) {
    percent = 8;
  }
  if (asset.price.steam.mean > 10000) {
    percent = 9;
  }

  const prices = await MarketPrices.find({ name: { $in: asset.stickers.map(it => it.name) } });
  for (let i = 0; i < asset.stickers.length; i++) {
    if (asset.name.toLowerCase().indexOf('souvenir') !== -1) {
      asset.stickers[i].price = 0;
      // eslint-disable-next-line no-continue
      continue;
    }

    const price = prices.find(it => it.name === asset.stickers[i].name);
    if (price) {
      if (!asset.stickers[i].wear) {
        asset.stickers[i].price = Math.round(price.prices.steam_in * percent) / 100;
      } else {
        asset.stickers[i].price = 0;
      }
    } else {
      asset.stickers[i].price = 0;
    }
  }
};

function fillAsset(asset, steamId, floatAsset) {
  if (!asset.description || !(asset.description instanceof Object)) {
    logger.error(`[updateUserInventory] no description: [${asset.description}]`);
    asset.description = {};
  }
  if (!asset.description.tags) {
    asset.description.tags = [];
  }

  if (!asset.description.icon_url_large || !asset.description.icon_url_large.length) {
    asset.description.icon_url_large = asset.description.icon_url;
  }

  const expiration = asset.description.cache_expiration;
  const assetDB = {
    price: asset.price,
    userSteamId: steamId,
    appid: asset.appid,
    amount: asset.amount,
    assetid: asset.assetid,
    classid: asset.classid,
    contextid: `${asset.contextid}`,
    instanceid: asset.instanceid,
    marketable: !!asset.description.marketable,
    float: floatAsset.float,
    paintseed: floatAsset.paintSeed,
    tradable: !!asset.description.tradable,
    tradeBan: expiration ? new Date(expiration) : null,
    market_tradable_restriction: asset.description.market_tradable_restriction,
    name: asset.description.market_name,
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

  if (floatAsset.stickers && floatAsset.stickers.length > 0) {
    assetDB.stickers = (floatAsset.stickers || []).map((it, index) => {
      if (!it) {
        return null;
      }
      if (!it.name) {
        it.name = '';
      }
      return {
        slot: it.slot,
        wear: it.wear,
        img: assetDB.stickerPics ? assetDB.stickerPics[index] : '',
        name: it.name.indexOf('Sticker |') === -1 ? `Sticker | ${it.name}` : it.name,
      };
    });
  }

  return assetDB;
}

async function closeAuctions(steamId, assetid) {
  await Auction.updateMany(
    { status: 'open', steamId, 'items.assetid': assetid },
    {
      $set: {
        status: 'close',
        autoClose: true,
      },
    },
  );

  const auctions = await Auction.find({
    status: 'open',
    'bets.steamId': steamId,
    'bets.tradeObject.items.assetid': assetid,
  })
    .lean()
    .exec();
  for (let i = 0; i < auctions.length; i++) {
    const auction = auctions[i];
    auction.bets = auction.bets.filter(ab => {
      return !(!ab || !ab.tradeObject);
    });
    auction.bets = auction.bets.filter(bet => {
      return !bet.tradeObject.items.find(item => item.assetid === assetid);
    });
    // eslint-disable-next-line no-await-in-loop
    await Auction.updateOne({ _id: auction._id }, { $set: { bets: auction.bets } });
  }
}

async function saveUserSteamItems(user, data) {
  if (!data.appId) {
    if (!data.assets || !data.assets.length) {
      return {
        allSkinsCount: 0,
        allSkinsPrice: 0,
        ItemsLoad: 0,
        GameID: 'fail',
      };
    }
    data.appId = data.assets[0].appid.toString();
  }
  if (!data.assets) data.assets = [];
  if (!data.descriptions) data.descriptions = [];

  const assetNames = [];
  data.assets = data.assets.map(asset => {
    asset.description = data.descriptions.filter(d => d.classid === asset.classid)[0] || {};
    assetNames.push(asset.description.market_name);
    return asset;
  });

  const steamPrices = await MarketPrices.find({ name: { $in: assetNames }, appid: data.appId });

  data.assets = data.assets.map(asset => {
    const steamPrice = steamPrices.filter(price => {
      return price.name === asset.description.market_hash_name;
    })[0];

    if (steamPrice && steamPrice.prices) {
      asset.steamPriceID = steamPrice._id;
      asset.price = {
        steam: {
          mean: steamPrice.prices.steam_in * 100,
          safe: steamPrice.prices.steam_in * 100,
        },
      };
    } else {
      asset.price = {
        steam: {
          mean: 1,
          safe: 1,
        },
      };
    }
    return asset;
  });

  data.assets.sort((b, a) => {
    if (!a.price || !b.price) {
      return 0;
    }
    if (a.price.steam.safe > b.price.steam.safe) {
      return 1;
    }
    return -1;
  });
  const floatAssetIds = await FloatAssetId.find({ assetId: { $in: data.assets.map(asset => asset.assetid) } });
  let steamItems = [];

  for (let i = 0; i < data.assets.length; i++) {
    const asset = data.assets[i];
    let action = '';

    // eslint-disable-next-line eqeqeq
    if (asset.description.actions && asset.description.actions.length > 0 && data.appId == 730) {
      const link = asset.description.actions[0].link || '';
      action = link.substr(link.indexOf('assetid%D') + 9);
    }

    let floatAsset = floatAssetIds.find(it => it.assetId === asset.assetid);

    const tagType = asset.description.tags.filter(it => it.category === 'Type')[0];
    const tagExterior = asset.description.tags.filter(it => it.category === 'Exterior')[0];

    if (
      !floatAsset &&
      action &&
      action !== '' &&
      // eslint-disable-next-line eqeqeq
      data.appId == 730 &&
      tagType &&
      tagType.localized_tag_name !== 'Graffiti' &&
      tagType.localized_tag_name !== 'Container' &&
      tagType.localized_tag_name !== 'Collectible' &&
      tagType.localized_tag_name !== 'Agent' &&
      tagType.localized_tag_name !== 'Sticker' &&
      tagExterior &&
      tagExterior.localized_tag_name !== 'Not Painted'
    ) {
      floatAsset = new FloatAssetId({ float: '0', assetId: asset.assetid, steamId: user.steamId, action });
      // eslint-disable-next-line no-await-in-loop
      await floatAsset.save();
    }
    if (!floatAsset) {
      floatAsset = { float: 'unavailable' };
    }
    if (floatAsset.float === '0') {
      floatAsset.float = 'wait...';
    }
    const assetRes = fillAsset(asset, user.steamId, floatAsset);
    if (assetRes.stickers && assetRes.stickers.length > 0) {
      // eslint-disable-next-line no-await-in-loop
      await setStickerPrice(assetRes);
    }

    steamItems.push(assetRes);
  }

  let inventory = await UserSteamItems.findOne({
    steamId: user.steamId,
    appId: data.appId,
  });

  if (inventory) {
    const oldAssets = inventory.steamItems.map(item => item.assetid);
    const newAssets = steamItems.map(item => item.assetid);
    const newItems = steamItems.filter(item => !oldAssets.includes(item.assetid));
    const lostItems = inventory.steamItems.filter(item => !newAssets.includes(item.assetid));
    if (lostItems.length || newItems.length) {
      for (let j = 0; j < lostItems.length; j++) {
        // eslint-disable-next-line no-await-in-loop
        await closeAuctions(user.steamId, lostItems[j].assetid);
        // eslint-disable-next-line no-await-in-loop
        // await closeTrades(user.steamId, lostItems[j].assetid);
      }
      await new UserInventoryUpdate({
        steamId: user.steamId,
        appId: data.appId,
        newItems,
        lostItems,
      }).save();
    }
    if (lostItems.length) {
      await Comment.deleteMany({ entityId: { $in: lostItems.map(item => item.assetid) } });
      await Like.deleteMany({ entityId: { $in: lostItems.map(item => item.assetid) } });
      await MarketItem.deleteMany({ assetid: { $in: lostItems.map(item => item.assetid) } });
    }
    steamItems = steamItems.map(item => {
      if (!oldAssets.includes(item.assetid)) {
        item.tradeBanExpireTimestamp = +new Date() + 7 * 24 * 60 * 60 * 1000;
      }
      return item;
    });
    inventory.steamItems = steamItems;
    await UserSteamItems.updateOne({ _id: inventory._id }, { $set: { steamItems } });
  } else {
    inventory = new UserSteamItems({
      steamId: user.steamId,
      appId: data.appId,
      steamItems,
    });

    await inventory.save();
  }

  const allSkinsCount = inventory.steamItems.length;
  const allSkinsPrice = inventory.steamItems.reduce(
    (sum, cur) => parseInt(sum || 0, 10) + parseInt((cur.price && cur.price.steam ? cur.price.steam.safe : 0) || 0, 10),
    0,
  );

  return {
    allSkinsCount,
    allSkinsPrice,
    ItemsLoad: data.assets.length || 0,
    GameID: data.appId,
  };
}

async function updateUserItems(user, inventory) {
  const promiseArr = [];

  let hiddenCount = 0;
  for (let i = 0; i < inventory.length; i++) {
    if (inventory[i] && !inventory[i].error) {
      // skinsCount += (inventory[i].assets || []).length;
      promiseArr.push(saveUserSteamItems(user, inventory[i]));
    } else if (inventory[i].error === 'hidden') {
      hiddenCount++;
    } else if (inventory[i].error === 'requestBan') {
      // eslint-disable-next-line no-await-in-loop
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            lastSteamItemsUpdate: 777,
            lastSteamItemsUpdateInProgress: false,
            steamItemsUpdateTries: 0,
            allSkinsCount: 0,
            allSkinsPrice: 0,
          },
        },
      );
      return;
    }
  }

  if (hiddenCount === 2) {
    await sendPushV3(user, {
      type: 'INFO',
      title: i18n((user.locale || 'en').toLowerCase()).inventoryHidden.title,
      content: i18n((user.locale || 'en').toLowerCase()).inventoryHidden.content,
    });
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          lastSteamItemsUpdateInProgress: false,
          steamItemsUpdateTries: 0,
        },
      },
    );
    return;
  }

  const invs = await Promise.all(promiseArr);

  let allSkinsCount = 0;
  let allSkinsPrice = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const inv of invs) {
    allSkinsCount += inv.allSkinsCount;
    allSkinsPrice += inv.allSkinsPrice;
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        lastSteamItemsUpdateInProgress: false,
        steamItemsUpdateTries: 0,
        allSkinsCount,
        allSkinsPrice,
      },
    },
  );

  if (new Date(user.lastSteamItemsUpdate).getTime() !== 777) {
    // await sendPushV3(user, {
    //   type: 'INFO',
    //   title: i18n((user.locale || 'en').toLowerCase()).inventoryUpdated.title,
    //   content: i18n((user.locale || 'en').toLowerCase()).inventoryUpdated.content,
    // });
  }
}

async function update(user) {
  const start = Date.now();
  const userInventories = await loadUsersInventories([user]);
  // eslint-disable-next-line no-restricted-syntax
  // eslint-disable-next-line no-await-in-loop
  await User.updateOne(
    { steamId: user.steamId },
    {
      $set: {
        lastSteamItemsUpdate: new Date(),
        lastSteamItemsUpdateInProgress: true,
      },
    },
  );

  const res = updateUserItems(
    user,
    userInventories.filter(it => it.steamId === user.steamId),
  );
  return {
    time: (Date.now() - start) / 1000,
    result: res,
  };
}

module.exports = {
  updateUserItems,
  update,
};
