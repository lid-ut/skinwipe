const getNameAndTag = require('./getNameAndTag');
const categories = require('../modules/filters/categories');

module.exports = async function filterItems(user, userItems, filters, offset, limit) {
  let items = [];

  if (userItems) {
    for (let i = 0; i < userItems.length; i++) {
      if (userItems[i] && userItems[i].steamItems) {
        items = [...items, ...userItems[i].steamItems];
      }
    }
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
    if (filters.dota2) {
      items = items.filter(item => {
        if (item.appid !== 570) return true;
        if (filters.dota2.rarity && filters.dota2.rarity.length > 0) {
          if (!item.Rarity || filters.dota2.rarity.indexOf(item.Rarity) === -1) return false;
        }
        if (filters.dota2.quality && filters.dota2.quality.length > 0) {
          if (!item.Quality || filters.dota2.quality.indexOf(item.Quality) === -1) return false;
        }
        if (filters.dota2.hero && filters.dota2.hero.length > 0) {
          if (!item.Hero || filters.dota2.hero.indexOf(item.Hero) === -1) return false;
        }
        if (filters.dota2.type && filters.dota2.type.length > 0) {
          if (!item.Type || filters.dota2.type.indexOf(item.Type) === -1) return false;
        }
        if (filters.dota2.slot && filters.dota2.slot.length) {
          if (!item.Slot || filters.dota2.slot.indexOf(item.Slot) === -1) return false;
        }
        if (filters.dota2.runeNames && filters.dota2.runeNames.length) {
          if (!item.runeNames || !item.runeNames.length) return false;
          for (let i = 0; i < filters.dota2.runeNames.length; i++) {
            return item.runeNames.reduce((result, rune) => {
              result = result || rune.match(new RegExp(filters.dota2.runeNames[i], 'i'));
              return result;
            }, false);
          }
        }
        return true;
      });
    } else {
      items = items.filter(item => {
        return item.appid !== 570;
      });
    }
    if (filters.csgo) {
      items = items.filter(item => {
        if (item.appid !== 730) return true;
        if (filters.csgo.weapon && filters.csgo.weapon.length > 0) {
          if (!item.Weapon || filters.csgo.weapon.indexOf(item.Weapon) === -1) return false;
        }
        if (filters.csgo.exterior && filters.csgo.exterior.length > 0) {
          if (!item.Exterior || filters.csgo.exterior.indexOf(item.Exterior) === -1) return false;
        }
        if (filters.csgo.statTrack) {
          if (!item.Quality || item.Quality.indexOf('stattrak') === -1) return false;
        }

        if (
          filters.csgo.float &&
          !(
            (filters.csgo.float.to === 1000 || filters.csgo.float.to === 10000) &&
            (filters.csgo.float.from === 1 || filters.csgo.float.from * 10 === 1)
          )
        ) {
          item.floatInt = Math.floor(parseFloat(item.float) * 1000);
          if (!item.floatInt) return false;
          if (filters.csgo.float.from) {
            if (item.floatInt < filters.csgo.float.from) return false;
          }
          if (filters.csgo.float.to) {
            if (item.floatInt > filters.csgo.float.to) return false;
          }
        }
        if (filters.csgo.stickerCount) {
          if (!item.stickerNames || item.stickerNames.length !== parseInt(filters.csgo.stickerCount)) return false;
        }
        if (filters.csgo.stickerNames && filters.csgo.stickerNames.length) {
          if (!item.stickerNames || !item.stickerNames.length) return false;

          if (filters.csgo.stickerNames) {
            let res = false;
            for (let i = 0; i < filters.csgo.stickerNames.length; i++) {
              res =
                res ||
                item.stickerNames.reduce((result, sticker) => {
                  // eslint-disable-next-line no-useless-escape
                  result = result || sticker.match(new RegExp(filters.csgo.stickerNames[i].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'));
                  return result;
                }, false);
              console.log(res);
            }
            if (!res) {
              return false;
            }
          }
        }
        if (filters.csgo.quality && filters.csgo.quality.length) {
          if (filters.csgo.quality.indexOf(item.Quality) === -1) return false;
        }
        if (filters.csgo.type && filters.csgo.type.length) {
          if (filters.csgo.type.indexOf(item.Type) === -1) return false;
        }
        if (filters.csgo.paintSeed && filters.csgo.paintSeed.length) {
          if (!item.float || !item.float.paintSeed) return false;
          if (filters.csgo.paintSeed) {
            let res = false;
            for (let i = 0; i < filters.csgo.paintSeed.length; i++) {
              res =
                res ||
                item.float.paintSeed.reduce((result, seed) => {
                  result = result || seed.match(new RegExp(filters.csgo.paintSeed[i], 'i'));
                  return result;
                }, false);
            }
            if (!res) {
              return false;
            }
          }
        }
        if (filters.csgo.category) {
          let have = false;
          // eslint-disable-next-line no-restricted-syntax
          for (const category of filters.csgo.category) {
            if (!category.items || category.items.length === 0) {
              // eslint-disable-next-line no-loop-func
              const categoryBase = categories.filter(it => it.name === category.name)[0];
              category.items = categoryBase ? categoryBase.items : [];
            }
            // eslint-disable-next-line no-loop-func
            category.items.forEach(itemCat => {
              let leftSide = '';
              if (item.name.indexOf('|') !== -1) {
                leftSide = item.name.split(' | ')[0];
              }
              if (leftSide.toLowerCase().indexOf(itemCat.toLowerCase()) !== -1) {
                have = true;
              }
              if (item.Type.toLowerCase().indexOf(itemCat.toLowerCase()) !== -1) {
                have = true;
              }
            });
          }
          if (!have) {
            return false;
          }
        }
        return true;
      });
    } else {
      items = items.filter(item => {
        return item.appid !== 730;
      });
    }
    if (filters.tf2) {
      items = items.filter(item => {
        if (item.appid !== 440) return true;
        if (filters.tf2.class && filters.tf2.class.length > 0) {
          if (!item.Class || filters.tf2.class.indexOf(item.Class) === -1) return false;
        }
        if (filters.tf2.quality && filters.tf2.quality.length > 0) {
          if (!item.Quality || filters.tf2.quality.indexOf(item.Quality) === -1) return false;
        }
        if (filters.tf2.type) {
          if (!item.Type || filters.tf2.type.indexOf(item.Type) === -1) return false;
        }
        return true;
      });
    } else {
      items = items.filter(item => {
        return item.appid !== 440;
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
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const fullName = `${item.name}`;
    item.steamId = user.steamId;
    item.amount = parseInt(item.amount || 1, 10);
    if (item.float === null || item.float === undefined || item.float === 'wait...') {
      item.float = 'unavailable';
    }
    item.paintWear = item.float === 'unavailable' ? null : parseFloat(item.float.substr(0, 10));
    item.float = item.float === 'unavailable' ? null : item.float.substr(0, 10);
    item.name = getNameAndTag(item).name;
    item.ExteriorMin = getNameAndTag(item).tag;
    items[i] = { ...item, fullName };
  }
  return { error: null, result: items };
};
