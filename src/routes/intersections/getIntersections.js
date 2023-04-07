const User = require('../../models/User');
const Settings = require('../../models/Settings');
const UserSteamItems = require('../../models/UserSteamItems');
const config = require('../../../config');

const filterItems = require('../../helpers/filterItems');
const getNameAndTag = require('../../helpers/getNameAndTag');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const getTop10Items = userItems => {
  let items = [];

  if (userItems) {
    for (let i = 0; i < userItems.length; i++) {
      if (userItems[i] && userItems[i].steamItems) {
        items = [...items, ...userItems[i].steamItems];
      }
    }
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    item.ExteriorMin = getNameAndTag(item).tag;
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
};

async function getUserIntersection(user, userItems, obj, filters) {
  if (!obj || !obj.steamId) {
    return null;
  }
  if (!userItems) {
    return null;
  }

  const items = filterItems(obj, userItems, filters, 0, 300).result || [];
  const imageTopArr = items
    .map(item => {
      return { image: item.image_small || item.image_large, appid: item.appid };
    })
    .slice(0, 10);

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

  const top10Items = getTop10Items(userItems);
  return {
    steamId: obj.steamId,
    statusMessage: obj.subscriber && !obj.chatBanned ? obj.statusMessage : '',
    imageTop,
    appId,
    giveSkinCount: obj.allSkinsCount,
    allSkinsCount: obj.allSkinsCount,
    personaname: obj.personaname,
    bans: obj.bans,
    avatar: obj.avatarfull,
    coinCount: 0,
    allMySkinsCountForTrade: user.allSkinsCount,
    online,
    subscriber: obj.subscriber,
    isFriend,

    blackListed: (user.blacklist || []).indexOf(obj.steamId) > -1,
    heBlackListedMe: (obj.blacklist || []).indexOf(user.steamId) > -1,

    top10Items,
  };
}

async function getUsersItemsInfo(user, users, usersItems, filters) {
  return Promise.all(
    users.map(userObj => {
      return getUserIntersection(
        user,
        usersItems.filter(u => u.steamId === userObj.steamId),
        userObj,
        filters,
      );
    }),
  );
}

function addPriceFilter(find, price) {
  if (!find.steamItems) {
    find.steamItems = {};
  }
  if (!find.steamItems.$elemMatch) {
    find.steamItems.$elemMatch = {};
  }
  find.steamItems.$elemMatch['price.steam.mean'] = {
    $gte: price.min || 0,
    $lte: price.max || 9999999,
  };
  return find;
}

function addNameFilter(find, name) {
  if (!find.steamItems) {
    find.steamItems = {};
  }
  if (!find.steamItems.$elemMatch) {
    find.steamItems.$elemMatch = {};
  }
  find.steamItems.$elemMatch.name = { $regex: name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), $options: 'i' };
  return find;
}

async function getUsersSteamIdByFilters(filters) {
  let findObj = {};
  const dota2 = config.steam.games_id.DotA2.toString();
  const csgo = config.steam.games_id.CSGO.toString();
  const tf2 = config.steam.games_id.TF2.toString();

  if (filters) {
    const filtersArr = [];
    if (filters[dota2]) {
      const cur = filters[dota2];
      let currentFiltersObj = {
        'steamItems.appid': config.steam.games_id.DotA2,
      };
      const match = {};
      if (cur.Rarity && cur.Rarity.length > 0)
        match.Rarity = {
          $regex: cur.Rarity.join('|'),
        };
      if (cur.Quality && cur.Quality.length > 0)
        match.Quality = {
          $regex: cur.Quality.join('|'),
        };
      if (cur.Hero && cur.Hero.length > 0)
        match.Hero = {
          $regex: cur.Hero.join('|'),
        };
      if (cur.Type && cur.Type.length > 0)
        match.Type = {
          $regex: cur.Type.join('|'),
        };
      if (cur.Slot && cur.Slot.length > 0)
        match.Slot = {
          $regex: cur.Slot.join('|'),
        };
      if (Object.keys(match).length) {
        currentFiltersObj.steamItems = { $elemMatch: match };
      }
      if (filters.price && (filters.price.min || filters.price.max)) {
        currentFiltersObj = addPriceFilter(currentFiltersObj, filters.price);
      }
      if (filters.name && filters.name.length) {
        if (/^[a-zA-Z0-9|\s()™★-]*$/.test(filters.name)) {
          currentFiltersObj = addNameFilter(currentFiltersObj, filters.name);
        }
      }
      filtersArr.push(currentFiltersObj);
    }
    if (filters[csgo]) {
      const cur = filters[csgo];
      let currentFiltersObj = {
        'steamItems.appid': config.steam.games_id.CSGO,
      };
      const match = {};
      if (cur.Rarity && cur.Rarity.length > 0)
        match.Rarity = {
          $regex: cur.Rarity.join('|'),
        };
      if (cur.Quality && cur.Quality.length > 0)
        match.Quality = {
          $regex: cur.Quality.join('|'),
        };
      if (cur.Weapon && cur.Weapon.length > 0)
        match.Weapon = {
          $regex: cur.Weapon.join('|'),
        };
      if (cur.Type && cur.Type.length > 0)
        match.Type = {
          $regex: cur.Type.join('|'),
        };
      if (cur.Exterior && cur.Exterior.length > 0)
        match.Exterior = {
          $regex: cur.Exterior.join('|'),
        };
      if (cur.ItemSet && cur.ItemSet.length > 0) {
        match.ItemSet = {
          $regex: cur.ItemSet.join('|'),
        };
      }
      if (cur.StickerCount) {
        match.stickerNames = {
          $size: cur.StickerCount,
        };
      }
      if (filters.PaintSeed && filters.PaintSeed.length > 0) {
        match.float = {
          paintSeed: {
            $in: filters.PaintSeed,
          },
        };
      }
      if (Object.keys(match).length) {
        currentFiltersObj.steamItems = { $elemMatch: match };
      }
      if (filters.price && (filters.price.min || filters.price.max)) {
        currentFiltersObj = addPriceFilter(currentFiltersObj, filters.price);
      }
      if (filters.name && filters.name.length) {
        if (/^[a-zA-Z0-9|\s()™★-]*$/.test(filters.name)) {
          currentFiltersObj = addNameFilter(currentFiltersObj, filters.name);
        }
      }
      filtersArr.push(currentFiltersObj);
    }
    if (filters[tf2]) {
      const cur = filters[tf2];
      let currentFiltersObj = {
        'steamItems.appid': config.steam.games_id.TF2,
      };
      const match = {};
      if (cur.Class && cur.Class.length > 0)
        match.Class = {
          $regex: cur.Class.join('|'),
        };
      if (cur.Quality && cur.Quality.length > 0)
        match.Quality = {
          $regex: cur.Quality.join('|'),
        };
      if (cur.Weapon && cur.Weapon.length > 0)
        match.Weapon = {
          $regex: cur.Weapon.join('|'),
        };
      if (cur.Type && cur.Type.length > 0)
        match.Type = {
          $regex: cur.Type.join('|'),
        };
      if (Object.keys(match).length) {
        currentFiltersObj.steamItems = { $elemMatch: match };
      }
      if (filters.price && (filters.price.min || filters.price.max)) {
        currentFiltersObj = addPriceFilter(currentFiltersObj, filters.price);
      }
      if (filters.name && filters.name.length) {
        if (/^[a-zA-Z0-9|\s()™★-]*$/.test(filters.name)) {
          currentFiltersObj = addNameFilter(currentFiltersObj, filters.name);
        }
      }
      filtersArr.push(currentFiltersObj);
    }

    if (filtersArr.length > 0) {
      if (filtersArr.length === 1) {
        findObj = filtersArr[0];
      } else {
        findObj = {
          $or: filtersArr,
        };
      }
    } else {
      if (filters.price && (filters.price.min || filters.price.max)) {
        findObj = addPriceFilter(findObj, filters.price);
      }
      if (filters.name && filters.name.length) {
        if (/^[a-zA-Z0-9|\s()™★-]*$/.test(filters.name)) {
          findObj = addNameFilter(findObj, filters.name);
        }
      }
    }
  }

  if (!Object.keys(findObj).length) {
    return 'noFilters';
  }
  const result = await UserSteamItems.distinct('steamId', findObj);

  return result;
}

async function getUsersByTraderTopOnlyFromArray(limit, offset, online, filters, username) {
  const ids = await getUsersSteamIdByFilters(filters);
  const idleTime = new Date(Date.now() - 60 * 60 * 1000);
  const findTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const findObj = {
    lastActiveDate: { $gte: findTime },
    allSkinsCount: { $gt: 0 },
  };

  if (username && username.length) {
    if (/^[a-zA-Z0-9|\s()™★-]*$/.test(username)) {
      findObj.$or = [
        { steamId: { $regex: username, $options: 'i' } },
        { personaname: { $regex: username.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), $options: 'i' } },
      ];
      delete findObj.lastActiveDate;
      delete findObj.allSkinsCount;
    }
  }

  if (ids !== 'noFilters') {
    findObj.steamId = { $in: ids };
  }

  if (filters.onlySub === true) {
    findObj.subscriber = true;
  }

  if (online === 1) {
    findObj.lastActiveDate = { $gte: idleTime };
  } else if (online === 2) {
    findObj.lastActiveDate = { $lt: idleTime, $gte: findTime };
  }
  const users = await User.find(findObj).sort({ traderRating: -1 }).skip(offset).limit(limit).lean().exec();
  const usersItems = await UserSteamItems.find({ steamId: { $in: users.map(u => u.steamId) } })
    .sort({ _id: 1 })
    .lean();

  return { users, usersItems };
}

async function getList(params) {
  const user = params.user;
  const limit = parseInt(params.limit, 10) || 25;
  const offset = parseInt(params.offset, 10) || 0;
  const online = params.online;
  const filters = params.filters;
  const username = params.username;

  const { users, usersItems } = await getUsersByTraderTopOnlyFromArray(limit, offset, online, filters, username);
  return getUsersItemsInfo(user, users, usersItems, filters);
}

module.exports = async function getIntersections(req, res) {
  // eslint-disable-next-line no-undef
  if (redisClient && redisGet) {
    // eslint-disable-next-line no-undef
    const result = await redisGet(req.redisToken);
    if (result) {
      res.json(result);
      return;
    }
  }

  const username = req.body.username;
  if (typeof req.body.offset === 'undefined' || typeof req.body.limit === 'undefined') {
    res.json({ status: 'error' });
  }
  const settings = await Settings.findOne();
  const traders = settings.traders.all;
  const tradersOnline = settings.traders.online;

  let filters = req.body.filters;
  const offset = parseInt(req.body.offset, 10) || 0;
  const limit = parseInt(req.body.limit, 10) || 0;
  if (typeof filters === 'string') {
    try {
      filters = JSON.parse(filters);
    } catch (e) {
      logger.error('getIntersections', { e });
      filters = [];
    }
  }

  let online = 0;
  if (req.body.online && [1, 2].indexOf(parseInt(req.body.online, 10)) > -1) {
    online = parseInt(req.body.online, 10);
  }

  const intersections = await getList({
    user: req.user,
    filters,
    limit,
    offset,
    online,
    username,
  });

  const result = {
    status: 'success',
    traders,
    online: tradersOnline,
    intersections,
    intersections_offset: req.body.offset + intersections.length,
  };
  if (redisClient) {
    redisClient.setex(req.redisToken, 3, JSON.stringify(result));
  }
  res.json(result);
};
