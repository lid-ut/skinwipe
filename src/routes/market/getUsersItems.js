const CommonItem = require('../../models/CommonItem');
const Settings = require('../../models/Settings');
const getNameAndTag = require('../../helpers/getNameAndTag');
const getCSGOCategoryFind = require('../../modules/filters/getCSGOCategoryFind');

const getFilters = async (user, filters, virtual = false) => {
  if (!filters) {
    return {};
  }

  const skip = new Date();

  let findObject = {
    createdAt: { $lte: skip },
  };

  if (filters.price) {
    let priceFilter;
    if (filters.price && filters.price.max && filters.price.max !== 1000000) {
      priceFilter = { $lte: filters.price.max };
    }
    if (filters.price && filters.price.min && filters.price.min !== 1) {
      priceFilter = { ...priceFilter, $gte: filters.price.min };
    }
    if (priceFilter) {
      findObject = { 'price.steam.mean': priceFilter, ...findObject };
    }
  }

  if (filters.name && filters.name.length) {
    findObject = { ...findObject, name: new RegExp(filters.name, 'i') };
  }

  if (filters.csgo) {
    if (filters.csgo.rarity && filters.csgo.rarity.length > 0) {
      findObject = { ...findObject, Rarity: { $in: filters.csgo.rarity } };
    }
    if (filters.csgo.quality && filters.csgo.quality.length > 0) {
      findObject = { ...findObject, Quality: { $in: filters.csgo.quality } };
    }
    if (filters.csgo.weapon && filters.csgo.weapon.length > 0) {
      findObject = { ...findObject, Weapon: { $in: filters.csgo.weapon } };
    }
    if (filters.csgo.type && filters.csgo.type.length > 0) {
      findObject = { ...findObject, Type: { $in: filters.csgo.type } };
    }
    if (filters.csgo.exterior && filters.csgo.exterior.length > 0) {
      findObject = { ...findObject, Exterior: { $in: filters.csgo.exterior } };
    }
    if (filters.csgo.itemSet && filters.csgo.itemSet.length > 0) {
      findObject = { ...findObject, ItemSet: { $in: filters.csgo.itemSet } };
    }
    if (filters.csgo.statTrack) {
      findObject = { ...findObject, Quality: 'stattrak™' };
    }
    if (filters.csgo.category) {
      findObject = { ...findObject, ...getCSGOCategoryFind(filters.csgo.category) };
    }

    let paintWear = {};
    if (filters.csgo.float) {
      const sortByFloat =
        (filters.csgo.float.to === 1000 || filters.csgo.float.to === 10000) &&
        (filters.csgo.float.from === 1 || filters.csgo.float.from * 10 === 1);
      if (!sortByFloat) {
        const from = filters.csgo.float.from / 1000;
        const to = filters.csgo.float.to / 1000;
        if (from) {
          paintWear = { paintWear: { $gte: from } };
        }
        if (to) {
          paintWear = { paintWear: { $lte: to } };
        }
        if (from && to) {
          paintWear = { paintWear: { $lte: to, $gte: from } };
        }
        if (from === 1 && to === 1000) {
          paintWear = {};
        }
        findObject = { ...findObject, ...paintWear };
      }
    }
    if (filters.csgo.stickerCount) {
      const stickerCountStr = `stickers.${filters.csgo.stickerCount - 1}`;
      findObject[stickerCountStr] = { $exists: true };
    }
    if (filters.csgo.stickerNames && filters.csgo.stickerNames.length) {
      const orArr = [];
      for (let i = 0; i < filters.csgo.stickerNames.length; i++) {
        // eslint-disable-next-line no-useless-escape
        orArr.push({ 'stickers.name': new RegExp(filters.csgo.stickerNames[i].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i') });
      }
      findObject = { ...findObject, $or: orArr };
    }
    if (filters.csgo.paintSeed && filters.csgo.paintSeed.length) {
      findObject = { ...findObject, paintseed: { $in: filters.csgo.paintSeed } };
    }
  }

  if (filters.dota2) {
    if (filters.dota2.rarity && filters.dota2.rarity.length > 0) {
      findObject = { ...findObject, Rarity: { $in: filters.dota2.rarity } };
    }
    if (filters.dota2.quality && filters.dota2.quality.length > 0) {
      findObject = { ...findObject, Quality: { $in: filters.dota2.quality } };
    }

    if (filters.dota2.type && filters.dota2.type.length > 0) {
      findObject = { ...findObject, Type: { $in: filters.dota2.type } };
    }
    if (filters.dota2.hero && filters.dota2.hero.length > 0) {
      findObject = { ...findObject, Hero: { $in: filters.hero.exterior } };
    }
    if (filters.dota2.statTrack) {
      findObject = { ...findObject, Quality: 'stattrak™' };
    }
    if (filters.dota2.runeNames && filters.dota2.runeNames.length) {
      const orArr = [];
      for (let i = 0; i < filters.dota2.runeNames.length; i++) {
        orArr.push({ 'runeNames.name': new RegExp(`^${filters.dota2.runeNames[i]}$`) });
      }
      findObject = { ...findObject, $or: orArr };
    }
  }

  return findObject;
};

module.exports = async (req, res) => {
  let sort = {
    'price.steam.percent': 1,
    _id: -1,
  };
  if (req.body.sort) {
    switch (req.body.sort) {
      case 'bestDealsAsc':
        sort = {
          'price.steam.percent': 1,
          _id: -1,
        };
        break;
      case 'priceAsc':
        sort = {
          'price.steam.mean': 1,
          _id: -1,
        };
        break;
      case 'priceDesc':
        sort = {
          'price.steam.mean': -1,
          _id: -1,
        };
        break;
      case 'dateAsc':
        sort = {
          createdAt: 1,
          _id: -1,
        };
        break;
      case 'dateDesc':
        sort = {
          createdAt: -1,
          _id: -1,
        };
        break;
      default:
        sort = {
          'price.steam.percent': 1,
          _id: -1,
        };
        break;
    }
  }

  let virtual = false;
  if (parseInt(req.appVersion, 10) >= 174) {
    virtual = true;
  }

  const page = req.params.page;

  const filters = await getFilters(req.user, req.body.filters, virtual);
  let items = await CommonItem.find(filters)
    .sort(sort)
    .limit(30)
    .skip((page - 1) * 30)
    .lean()
    .exec();

  const settings = await Settings.findOne();

  items = items
    .map(it => {
      if (it.price && it.price.steam) {
        it.ExteriorMin = getNameAndTag(it).tag;
        it.name = getNameAndTag(it).name;
        it.userSteamId = it.steamid;
        let price = Math.round(it.price.steam.mean);
        it.price.steam.sub = Math.round(it.price.steam.mean - (it.price.steam.mean / 100) * settings.market.discount);
        if (req.user.subscriber) {
          price = it.price.steam.sub;
        }
        it.price.steam.mean = price;
        it.price.steam.safe = price;

        for (let i = 0; i < it.stickers.length; i++) {
          it.stickers[i].name = it.stickers[i].name.replace('Sticker | ', '');
          it.stickers[i].img = it.stickerPics[i];
        }

        it.fullName = it.name;
        if (it.float) {
          it.paintWear = parseFloat(it.float);
        }
        return it;
      }
      return null;
    })
    .filter(it => !!it);

  res.json({
    status: 'success',
    result: items,
  });
};
