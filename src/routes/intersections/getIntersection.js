const UserSteamItems = require('../../models/UserSteamItems');
const User = require('../../models/User');
const config = require('../../../config');
const filterItems = require('../../helpers/filterItems');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getGameName(appId) {
  const dota2 = config.steam.games_id.DotA2.toString();
  const csgo = config.steam.games_id.CSGO.toString();

  switch (appId) {
    case dota2:
      return 'DotA 2';
    case csgo:
      return 'CS:GO';
    default:
      return 'aaa';
  }
}

async function top10Items(userItems) {
  let items = [];

  if (userItems) {
    for (let i = 0; i < userItems.length; i++) {
      if (userItems[i] && userItems[i].steamItems) {
        items = [...items, ...userItems[i].steamItems];
      }
    }
  }

  items.sort((b, a) => {
    if (!a.price || !b.price) {
      return 0;
    }
    if (a.price.steam.safe > b.price.steam.safe) {
      return 1;
    }
    return -1;
  });

  items = items.filter(item => {
    return !!item.price;
  });

  items = items.slice(0, 10);
  return items;
}

async function getUserIntersection(user, userItems, myItems, obj, filters) {
  if (!obj || !obj.steamId) {
    return null;
  }
  if (!userItems) {
    return null;
  }

  let CSSkinsCount = 0;
  let DotaSkinsCount = 0;
  let myCSSkinsCount = 0;
  let myDotaSkinsCount = 0;

  if (userItems) {
    for (let i = 0; i < userItems.length; i++) {
      if (userItems[i] && userItems[i].steamItems) {
        if (userItems[i].appId === '730') {
          CSSkinsCount = userItems[i].steamItems.length;
        } else if (userItems[i].appId === '570') {
          DotaSkinsCount = userItems[i].steamItems.length;
        }
      }
    }
  }

  if (myItems) {
    for (let i = 0; i < myItems.length; i++) {
      if (myItems[i] && myItems[i].steamItems) {
        if (myItems[i].appId === '730') {
          myCSSkinsCount = myItems[i].steamItems.length;
        } else if (myItems[i].appId === '570') {
          myDotaSkinsCount = myItems[i].steamItems.length;
        }
      }
    }
  }

  const iWantRarityArray = [];
  const items = filterItems(obj, userItems, filters, 0, 300).result || [];
  const imageTopArr = items
    .map(item => {
      return { image: item.image_small || item.image_large, appid: item.appid };
    })
    .slice(0, 10);

  if (!filters || Object.keys(filters).length === 0) {
    iWantRarityArray.push({
      name: 'Items',
      appId: '0',
      count: items.length,
    });
  } else {
    for (let i = 0; i < items.length; i++) {
      const appId = items[i].appid.toString();
      if (Object.keys(filters).indexOf(appId) !== -1) {
        const name = getGameName(appId);
        const irarity = iWantRarityArray.filter(it => it.name === name && it.appId === appId)[0];
        if (irarity) {
          irarity.count++;
        } else {
          iWantRarityArray.push({
            name,
            appId,
            count: 1,
          });
        }
      }
    }
  }

  let online = 0; // offline
  if (obj.lastActiveDate > new Date(Date.now() - 10 * 60 * 1000)) {
    online = 1; // online
  } else if (obj.lastActiveDate > new Date(Date.now() - 60 * 60 * 1000)) {
    online = 2; // idle
  }
  // Изображение
  let imageTop =
    'https://s-cdn.sportbox.ru/images/styles/960_auto/fp_fotos/22/91/d815718cb0c678463c61276440025c00598b606041e1b103979205.jpg';
  let appId = 0;
  if (imageTopArr && imageTopArr.length) {
    const imageNum = getRandomInt(0, imageTopArr.length - 1);
    imageTop = `https://steamcommunity-a.akamaihd.net/economy/image/${imageTopArr[imageNum].image}`;
    appId = imageTopArr[imageNum].appid;
  }
  const isFriend = (user.friends || []).findIndex(stid => stid === obj.steamId) > -1;
  return {
    steamId: obj.steamId,
    statusMessage: obj.subscriber && !obj.chatBanned ? obj.statusMessage : '',
    iWantRarityArray,
    imageTop,
    appId,
    giveSkinCount: obj.allSkinsCount,
    allSkinsCount: obj.allSkinsCount,
    personaname: obj.personaname,
    bans: obj.bans,
    avatar: obj.avatarfull,
    coinCount: 0,
    online,
    subscriber: obj.subscriber,
    isFriend,
    allMySkinsCountForTrade: user.allSkinsCount,

    blackListed: (user.blacklist || []).indexOf(obj.steamId) > -1,
    heBlackListedMe: (obj.blacklist || []).indexOf(user.steamId) > -1,

    CSSkinsCount,
    DotaSkinsCount,
    myCSSkinsCount,
    myDotaSkinsCount,
    top10Items: await top10Items(userItems),
  };
}

module.exports = async req => {
  if (!req.body.steamIdPartner) {
    return { status: 'error', code: 1, message: 'no partner steamid' };
  }
  const partner = await User.findOne({ steamId: req.body.steamIdPartner });
  if (!partner) {
    return { status: 'error', code: 2, message: 'no partner' };
  }
  const userItems = await UserSteamItems.find({ steamId: req.body.steamIdPartner }).lean();
  const myItems = await UserSteamItems.find({ steamId: req.user.steamId }).lean();
  let structuredData = await getUserIntersection(req.user, userItems, myItems, partner, []);

  if (redisClient) {
    //redisClient.setex(req.redisToken, 20, JSON.stringify(structuredData));
  }
  if (!structuredData) {
    structuredData = {};
  }
  structuredData.status = 'success';
  return structuredData;
};
