const config = require('../../config');
const getNameAndTag = require('./getNameAndTag');
const categories = require('../modules/filters/categories');

module.exports = function filterItems(user, userItems, filters, offset, limit) {
  const dota2 = config.steam.games_id.DotA2.toString();
  const csgo = config.steam.games_id.CSGO.toString();
  const tf2 = config.steam.games_id.TF2.toString();

  let items = [];

  if (userItems) {
    for (let i = 0; i < userItems.length; i++) {
      if (userItems[i] && userItems[i].steamItems) {
        items = [...items, ...userItems[i].steamItems];
      }
    }
  }

  if (filters && filters['753']) {
    delete filters['753'];
  }
  if (filters && filters['252490']) {
    delete filters['252490'];
  }

  if (filters && filters.price && (filters.price.min || filters.price.max)) {
    items = items.filter(item => {
      if (!item.price || !item.price.steam || !item.price.steam.mean) return false;
      if (item.price.steam.mean < (filters.price.min || 0)) {
        return false;
      }
      return item.price.steam.mean < (filters.price.max || 9999999);
    });
    delete filters.price;
  }
  if (filters && filters.name && filters.name.length) {
    if (/^[a-zA-Z0-9|\s()™★-]*$/.test(filters.name)) {
      items = items.filter(item => item.name.toLowerCase().indexOf(filters.name) > -1);
    }
    delete filters.name;
  }
  if (filters && Object.keys(filters).length > 0) {
    if (filters[dota2]) {
      items = items.filter(item => {
        if (item.appid !== parseInt(dota2, 10)) return true;
        if (filters[dota2].Rarity && filters[dota2].Rarity.length > 0) {
          if (!item.Rarity || filters[dota2].Rarity.indexOf(item.Rarity) === -1) return false;
        }
        if (filters[dota2].Quality && filters[dota2].Quality.length > 0) {
          if (!item.Quality || filters[dota2].Quality.indexOf(item.Quality) === -1) return false;
        }
        if (filters[dota2].Hero && filters[dota2].Hero.length > 0) {
          if (!item.Hero || filters[dota2].Hero.indexOf(item.Hero) === -1) return false;
        }
        if (filters[dota2].Type && filters[dota2].Type.length > 0) {
          if (!item.Type || filters[dota2].Type.indexOf(item.Type) === -1) return false;
        }
        if (filters[dota2].Slot && filters[dota2].Slot.length > 0) {
          if (!item.Slot || filters[dota2].Slot.indexOf(item.Slot) === -1) return false;
        }
        if (filters[dota2].runeNames && filters[dota2].runeNames.length) {
          if (!item.runeNames || !item.runeNames.length) return false;
          for (let i = 0; i < filters[dota2].runeNames.length; i++) {
            return item.runeNames.reduce((result, rune) => {
              result = result || rune.match(new RegExp(filters[dota2].runeNames[i], 'i'));
              return result;
            }, false);
          }
        }
        return true;
      });
    } else {
      items = items.filter(item => {
        return item.appid != parseInt(dota2, 10);
      });
    }
    if (filters[csgo]) {
      items = items.filter(item => {
        if (item.appid != parseInt(csgo, 10)) return true;
        if (filters[csgo].Rarity && filters[csgo].Rarity.length > 0) {
          if (!item.Rarity || filters[csgo].Rarity.indexOf(item.Rarity) === -1) return false;
        }
        if (filters[csgo].Quality && filters[csgo].Quality.length > 0) {
          if (!item.Quality || filters[csgo].Quality.indexOf(item.Quality) === -1) return false;
        }
        if (filters[csgo].Weapon && filters[csgo].Weapon.length > 0) {
          if (!item.Weapon || filters[csgo].Weapon.indexOf(item.Weapon) === -1) return false;
        }
        if (filters[csgo].Type && filters[csgo].Type.length > 0) {
          if (!item.Type || filters[csgo].Type.indexOf(item.Type) === -1) return false;
        }
        if (filters[csgo].Exterior && filters[csgo].Exterior.length > 0) {
          if (!item.Exterior || filters[csgo].Exterior.indexOf(item.Exterior) === -1) return false;
        }
        if (filters[csgo].ItemSet && filters[csgo].ItemSet.length > 0) {
          if (!item.ItemSet || filters[csgo].ItemSet.indexOf(item.ItemSet) === -1) return false;
        }
        if (filters[csgo].stickerCount) {
          if (!item.stickerNames || item.stickerNames.length != filters[csgo].stickerCount) return false;
        }
        if (filters[csgo].category) {
          let have = false;
          // eslint-disable-next-line no-restricted-syntax
          for (const category of filters[csgo].category) {
            if (!category.items || category.items.length === 0) {
              // eslint-disable-next-line no-loop-func
              const categoryBase = categories.filter(it => it.name === category.name)[0];
              category.items = categoryBase ? categoryBase.items : [];
            }
            // eslint-disable-next-line no-loop-func
            category.items.forEach(itemCat => {
              if (category.name === 'other') {
                if (item.Type.toLowerCase().indexOf(itemCat.toLowerCase()) !== -1) {
                  have = true;
                }
              }
              if (item.name.toLowerCase().indexOf(itemCat.toLowerCase()) !== -1) {
                have = true;
              }
            });
          }
          if (!have) {
            return false;
          }
        }
        if (filters[csgo].stickerNames && filters[csgo].stickerNames.length) {
          if (!item.stickerNames || !item.stickerNames.length) return false;
          for (let i = 0; i < filters[csgo].stickerNames.length; i++) {
            return item.stickerNames.reduce((result, sticker) => {
              result = result || sticker.match(new RegExp(filters[csgo].stickerNames[i], 'i'));
              return result;
            }, false);
          }
        }
        if (filters[csgo].paintSeed && filters[csgo].paintSeed.length) {
          if (!item.float || !item.float.paintSeed) return false;
          for (let i = 0; i < filters[csgo].paintSeed.length; i++) {
            return item.float.paintSeed.reduce((result, seed) => {
              result = result || seed.match(new RegExp(filters[csgo].paintSeed[i], 'i'));
              return result;
            }, false);
          }
        }
        return true;
      });
    } else {
      items = items.filter(item => {
        return item.appid != parseInt(csgo, 10);
      });
    }

    if (filters[tf2]) {
      items = items.filter(item => {
        if (item.appid != 440) return true;
        if (filters[tf2].class && filters[tf2].class.length > 0) {
          if (!item.Class || filters[tf2].class.indexOf(item.Class) === -1) return false;
        }
        if (filters[tf2].quality && filters[tf2].quality.length > 0) {
          if (!item.Quality || filters[tf2].quality.indexOf(item.Quality) === -1) return false;
        }
        if (filters[tf2].type) {
          if (!item.Type || filters[tf2].type.indexOf(item.Type) === -1) return false;
        }
        return true;
      });
    } else {
      items = items.filter(item => {
        return item.appid != parseInt(tf2, 10);
      });
    }
  }

  items.sort((b, a) => {
    if (a.tradable && !b.tradable) {
      return 1;
    }
    if (!a.tradable && b.tradable) {
      return -1;
    }
    if (a.price && b.price) {
      if (a.price.steam.safe > b.price.steam.safe) {
        return 1;
      }
      if (!a.price.steam.safe < b.price.steam.safe) {
        return -1;
      }
    }
    return 0;
  });

  items = items.filter(item => {
    return !!item.price;
  });

  if (offset > 0) {
    items = items.slice(offset);
  }
  if (limit > 0) {
    items = items.slice(0, limit);
  }
  items = items.map(item => {
    item.amount = parseInt(item.amount || 1, 10);
    if (item.float === null || item.float === undefined || item.float === 'wait...') {
      item.float = 'unavailable';
    }
    item.paintWear = item.float === 'unavailable' ? null : parseFloat(item.float.substr(0, 10));
    item.float = item.float === 'unavailable' ? null : item.float.substr(0, 10);
    item.name = getNameAndTag(item).name;
    item.ExteriorMin = getNameAndTag(item).tag;
    return item;
  });
  return { error: null, result: items };
};
