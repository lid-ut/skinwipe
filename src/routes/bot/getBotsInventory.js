const Item = require('../../models/BotSteamItem');
const getNameAndTag = require('../../helpers/getNameAndTag');
const config = require('../../../config');

const getFilters = (filters, fee) => {
  if (!filters) {
    return {};
  }
  let findObject = {
    buyer: null,
    visible: { $ne: false },
  };

  filters.tradableOnly = Boolean(filters.tradableOnly);
  if (filters.tradableOnly) {
    findObject.tradable = true;
  }

  if (filters.price) {
    let priceFilter;
    if (filters.price && filters.price.max && filters.price.max !== 1000000) {
      priceFilter = { $lte: filters.price.max / fee / 100 };
    }
    if (filters.price && filters.price.min && filters.price.min !== 1) {
      priceFilter = { ...priceFilter, $gte: filters.price.min / fee / 100 };
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
    let paintWear = {};
    if (filters.csgo.float) {
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
      if (from === 0 && to === 1) {
        paintWear = {};
      }
      findObject = { ...findObject, ...paintWear };
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

module.exports = async function getBotsInventory(req, res) {
  const page = req.body.page;
  const limit = req.body.limit || 30;
  let fee = config.fee;
  if (req.user.subscriber) {
    fee = 1;
  }
  if (req.headers['fee-key'] === config.tg.feeKey) {
    fee = 1;
  }
  const findObj = await getFilters(req.body.filters, fee);
  let items = await Item.find(findObj)
    .sort({ 'price.steam.mean': -1, name: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .lean()
    .exec();

  items = items
    .map(it => {
      if (it.price && it.price.steam) {
        let stikersPrice = Math.round((it.price.steam.converted - it.price.steam.base) * 100);
        const skinPrice = Math.round(it.price.steam.base * fee * 100);
        if (req.user.subscriber) {
          stikersPrice *= 0.93;
        }

        if (it.name.indexOf('Souvenir') !== -1) {
          it.price.steam.mean = skinPrice;
          it.price.steam.safe = skinPrice;
        } else {
          if (!req.user.subscriber) {
            it.price.steam.sub = Math.round(it.price.steam.base * 118 + stikersPrice * 0.93);
          } else {
            it.price.steam.sub = null;
          }
          it.price.steam.mean = Math.round(skinPrice + stikersPrice);
          it.price.steam.safe = Math.round(skinPrice + stikersPrice);
        }
        it.price.steam.base = skinPrice;
        it.price.steam.converted = Math.round(skinPrice + stikersPrice);

        it.ExteriorMin = getNameAndTag(it).tag;
        it.userSteamId = it.steamid;

        if (it.tradable) {
          it.tradeBan = null;
        }

        for (let i = 0; i < it.stickers.length; i++) {
          it.stickers[i].name = it.stickers[i].name.replace('Sticker | ', '');
          it.stickers[i].img = it.stickerPics[i];
          if (it.name.indexOf('Souvenir') !== -1) {
            it.stickers[i].price = 0;
          }
          if (req.user.subscriber) {
            it.stickers[i].price *= 0.93;
          }
          if (it.stickers[i].price === 0) {
            it.stickers[i].price = null;
          }
        }

        it.fullName = it.name;
        // it.stickerPics = (it.stickers || []).map(sticker => `https://api.steamapis.com/image/item/${730}/Sticker | ${sticker.name}`);
        // it.stickerNames = (it.stickers || []).map(sticker => `Sticker | ${sticker.name}`);
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
