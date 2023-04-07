const SteamItem = require('../../models/SteamItem');
const getNameAndTag = require('../../helpers/getNameAndTag');
const config = require('../../../config');

const getItemsInRangeV3 = async (offset, limit, sortBy, sortOrder, filters) => {
  offset = parseInt(offset, 10);
  limit = parseInt(limit, 10) || 20;

  let sort = {
    usersCount: -1,
    'prices.mean': -1,
  };
  if (sortBy && sortBy === 'users') {
    sort = {
      usersCount: sortOrder === 1 ? 1 : -1,
    };
  }
  if (sortBy && sortBy === 'price') {
    sort = {
      'prices.mean': sortOrder === 1 ? 1 : -1,
    };
  }

  const findObj = { usersCount: { $gt: 0 } };
  if (filters) {
    if (filters.dota2) {
      findObj.appid = 570;
      if (filters.dota2.type && filters.dota2.type.length) {
        findObj.Type = {
          $regex: filters.dota2.type.join('|'),
        };
      }
      if (filters.dota2.quality && filters.dota2.quality.length) {
        findObj.Quality = {
          $regex: filters.dota2.quality.join('|'),
        };
      }
      if (filters.dota2.rarity && filters.dota2.rarity.length) {
        findObj.Rarity = {
          $regex: filters.dota2.rarity.join('|'),
        };
      }
      if (filters.dota2.hero && filters.dota2.hero.length) {
        findObj.Hero = {
          $regex: filters.dota2.hero.join('|'),
        };
      }
      if (filters.dota2.slot && filters.dota2.slot.length) {
        findObj.Slot = {
          $regex: filters.dota2.slot.join('|'),
        };
      }
      if (filters.dota2.runeNames && filters.dota2.runeNames.length) {
        findObj.runeNames = {
          $elemMatch: {
            $regex: filters.dota2.runeNames.join('|'),
          },
        };
      }
    }

    if (filters.csgo) {
      findObj.appid = 730;
      if (filters.csgo.statTrack) {
        findObj.Quality = 'stattrak™';
      }
      if (filters.csgo.weapon && filters.csgo.weapon.length) {
        findObj.Weapon = {
          $regex: filters.csgo.weapon.join('|'),
        };
      }
      if (filters.csgo.exterior && filters.csgo.exterior.length) {
        findObj.Exterior = {
          $regex: filters.csgo.exterior.join('|'),
        };
      }
      if (filters.csgo.stickerCount) {
        findObj.stickerNames = {
          $size: filters.csgo.stickerCount,
        };
      }
      if (filters.csgo.stickerNames && filters.csgo.stickerNames.length) {
        findObj.stickerNames = {
          $regex: filters.csgo.stickerNames.join('|'),
        };
      }
      if (filters.csgo.quality && filters.csgo.quality.length) {
        findObj.Quality = {
          $regex: filters.csgo.quality.join('|'),
        };
      }
      if (filters.csgo.type && filters.csgo.type.length) {
        findObj.Type = {
          $regex: filters.csgo.type.join('|'),
        };
      }
      if (filters.csgo.paintSeed && filters.csgo.paintSeed.length) {
        findObj.float = {
          $elemMatch: {
            paintSeed: {
              $in: filters.csgo.paintSeed,
            },
          },
        };
      }
    }

    if (filters.tf2) {
      findObj.appid = 440;
      if (filters.tf2.class && filters.tf2.class.length > 0) {
        findObj.Class = {
          $regex: filters.tf2.class.join('|'),
        };
      }
      if (filters.tf2.quality && filters.tf2.quality.length) {
        findObj.Quality = {
          $regex: filters.tf2.quality.join('|'),
        };
      }
      if (filters.tf2.weapon && filters.tf2.weapon.length) {
        findObj.Weapon = {
          $regex: filters.tf2.weapon.join('|'),
        };
      }
      if (filters.tf2.type && filters.tf2.type.length) {
        findObj.Type = {
          $regex: filters.tf2.type.join('|'),
        };
      }
    }

    if (filters.price && (filters.price.min || filters.price.max)) {
      findObj['prices.mean'] = {
        $gte: (filters.price.min || 0) / 100,
        $lte: (filters.price.max || 9999999) / 100,
      };
    }

    if (filters.name && filters.name.length) {
      if (/^[a-zA-Z0-9|\s()™★-]*$/.test(filters.name)) {
        findObj.market_name = {
          $regex: filters.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
          $options: 'i',
        };
      }
    }
  }

  const items = await SteamItem.find(findObj).sort(sort).skip(offset).limit(limit).exec();
  return items;
};

module.exports = async function superInventory(req) {
  const preparedItems = await getItemsInRangeV3(req.params.offset, req.params.limit, req.body.sortBy, req.body.sortOrder, req.body.filters);

  if (!preparedItems || !preparedItems.length) {
    const result = {
      status: 'success',
      result: {
        items: [],
      },
    };
    if (redisClient) {
      redisClient.setex(req.redisToken, 30, JSON.stringify(result));
    }
    return result;
  }

  const items = [];
  for (let i = 0; i < preparedItems.length; i++) {
    const item = preparedItems[i];

    if (item.float === null || item.float === undefined || item.float === 'wait...') {
      item.float = 'unavailable';
    }
    items.push({
      price: {
        steam: {
          mean: Math.round(item.prices.mean * 100),
          safe: Math.round(item.prices.mean * 100),
        },
      },
      appid: item.appid,
      amount: item.usersCount || 1,
      contextid: `${item.contextid || 2}`,
      marketable: true,
      tradable: true,
      market_tradable_restriction: 0,
      name: item.market_hash_name,

      image_small: (item.image || '').replace('https://steamcommunity-a.akamaihd.net/economy/image/', ''),
      image_large: (item.image || '').replace('https://steamcommunity-a.akamaihd.net/economy/image/', ''),

      Quality: item.Quality,
      QualityName: item.QualityName,
      QualityColor: item.QualityColor,
      Rarity: item.Rarity,
      RarityColor: item.RarityColor,
      RarityName: item.RarityName,
      Class: item.Class,
      ClassName: item.ClassName,
      Hero: item.Hero,
      Slot: item.Slot,
      Type: item.Type,
      TypeName: item.TypeName,
      ItemSet: item.ItemSet,
      ItemSetName: item.ItemSetName,
      Weapon: item.Weapon,
      ExteriorMin: getNameAndTag(item).tag,
      Exterior: item.Exterior,
      paintWear: item.float === 'unavailable' ? null : parseFloat(item.float.substr(0, 10)),
      float: item.float === 'unavailable' ? null : item.float.substr(0, 10),

      stickerNames: item.stickerNames,
      runeNames: item.runeNames,
      slot: item.Slot,
    });
  }

  for (let i = 0; i < items.length; i++) {
    const gameName = config.steam.games_names[items[i].appid];
    if (req.user.bans && req.user.bans[gameName]) {
      items[i].tradable = false;
    }
  }

  const result = {
    status: 'success',
    result: {
      items,
    },
  };
  if (redisClient) {
    redisClient.setex(req.redisToken, 30, JSON.stringify(result));
  }
  return result;
};
