const config = require('../../config');
const SteamItem = require('../models/SteamItem');

const SteamItemController = {
  async getItemsByNames(itemNames) {
    return SteamItem.find({ market_hash_name: { $in: itemNames } }).lean();
  },

  async getItemsInRangeV2(params, sortByUsers, sortBy) {
    const offset = params.offset || 0;
    const limit = params.limit || 25;
    const dota2 = config.steam.games_id.DotA2.toString();
    const csgo = config.steam.games_id.CSGO.toString();

    let sort = sortByUsers ? { usersCount: -1, 'prices.mean': -1 } : { 'prices.mean': -1 };
    if (sortBy && sortBy.users) {
      sort = { usersCount: sortBy.users === 'asc' ? 1 : -1 };
    }
    if (sortBy && sortBy.price) {
      sort = { 'prices.mean': sortBy.price === 'asc' ? 1 : -1 };
    }

    const filters = params.filters || [];

    let findObj = { usersCount: { $gt: 0 } };
    if (filters) {
      const filtersArr = [];
      if (filters[dota2]) {
        const cur = filters[dota2];
        const currentFiltersObj = {
          appid: dota2,
        };
        if (cur.Rarity && cur.Rarity.length > 0)
          currentFiltersObj.Rarity = {
            $regex: cur.Rarity.join('|'),
          };
        if (cur.Quality && cur.Quality.length > 0)
          currentFiltersObj.Quality = {
            $regex: cur.Quality.join('|'),
          };
        if (cur.Hero && cur.Hero.length > 0)
          currentFiltersObj.Hero = {
            $regex: cur.Hero.join('|'),
          };
        if (cur.Type && cur.Type.length > 0)
          currentFiltersObj.Type = {
            $regex: cur.Type.join('|'),
          };
        if (cur.Slot && cur.Slot.length > 0)
          currentFiltersObj.Slot = {
            $regex: cur.Slot.join('|'),
          };
        filtersArr.push(currentFiltersObj);
      }

      if (filters[csgo]) {
        const cur = filters[csgo];
        const currentFiltersObj = {
          appid: csgo,
        };
        if (cur.Rarity && cur.Rarity.length > 0)
          currentFiltersObj.Rarity = {
            $regex: cur.Rarity.join('|'),
          };
        if (cur.Quality && cur.Quality.length > 0)
          currentFiltersObj.Quality = {
            $regex: cur.Quality.join('|'),
          };
        if (cur.Weapon && cur.Weapon.length > 0)
          currentFiltersObj.Weapon = {
            $regex: cur.Weapon.join('|'),
          };
        if (cur.Exterior && cur.Exterior.length > 0)
          currentFiltersObj.Exterior = {
            $regex: cur.Exterior.join('|'),
          };
        if (cur.ItemSet && cur.ItemSet.length > 0)
          currentFiltersObj.ItemSet = {
            $regex: cur.ItemSet.join('|'),
          };
        if (cur.Type && cur.Type.length > 0)
          currentFiltersObj.Type = {
            $regex: cur.Type.join('|'),
          };
        // if (cur.float && (cur.float.min || cur.float.max)) {
        //   currentFiltersObj.float = {
        //     $gte: cur.float.min || 0,
        //     $lte: cur.float.max || 1,
        //   };
        // }

        filtersArr.push(currentFiltersObj);
      }

      if (filtersArr.length > 1) {
        findObj = {
          $or: filtersArr,
          usersCount: { $gt: 0 },
        };
      } else if (filtersArr.length === 1) {
        findObj = { ...filtersArr[0], usersCount: { $gt: 0 } };
      }

      if (filters.price && (filters.price.min || filters.price.max)) {
        findObj['prices.mean'] = {
          $gte: (filters.price.min || 0) / 100,
          $lte: (filters.price.max || 9999999) / 100,
        };
      }

      if (filters.name && filters.name.length) {
        if (/^[a-zA-Z0-9|\s()™★-]*$/.test(filters.name)) {
          findObj.market_name = { $regex: filters.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), $options: 'i' };
        }
      }

      if (filters.priceCats && filters.priceCats.length) {
        const priceCats = [];
        if (filters.priceCats.indexOf('gt004') > -1) {
          priceCats.push({
            'prices.mean': { $gte: 0.04 },
          });
        }
        if (filters.priceCats.indexOf('gt006') > -1) {
          priceCats.push({
            'prices.mean': { $gte: 0.06 },
          });
        }
        if (filters.priceCats.indexOf('lt01') > -1) {
          priceCats.push({
            'prices.mean': { $lte: 0.1 },
          });
        }
        if (filters.priceCats.indexOf('gt01lt10') > -1) {
          priceCats.push({
            'prices.mean': { $gte: 0.1, $lte: 10 },
          });
        }
        if (filters.priceCats.indexOf('gt10') > -1) {
          priceCats.push({
            'prices.mean': { $gte: 10 },
          });
        }
        if (priceCats.length) {
          findObj = {
            $and: [findObj, { $or: priceCats }],
          };
        }
      }
    }
    return SteamItem.find(findObj).sort(sort).skip(offset).limit(limit).exec();
  },
};

module.exports = SteamItemController;
