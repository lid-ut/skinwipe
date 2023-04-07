const SteamItemFilters = require('../../models/SteamItemFilters');
const config = require('../../../config');
const categories = require('../../modules/filters/categories');

module.exports = async function run() {
  const filters = await SteamItemFilters.findOne();

  const allFilters = {
    [config.steam.games_id.DotA2]: {
      Rarity: filters['570'].Rarity,
      Quality: filters['570'].Quality,
      Hero: filters['570'].Hero,
      Type: filters['570'].Type,
      Slot: filters['570'].Slot,
    },
    [config.steam.games_id.CSGO]: {
      Rarity: filters['730'].Rarity,
      Quality: filters['730'].Quality,
      Type: filters['730'].Type,
      category: categories,
      Weapon: filters['730'].Weapon,
      ItemSet: filters['730'].ItemSet,
      Exterior: filters['730'].Exterior,
      Stickers: [0, 1, 2, 3],
    },
    [config.steam.games_id.TF2]: {
      Class: filters['440'].Class,
      Quality: filters['440'].Quality,
      Type: filters['440'].Type,
      Weapon: filters['440'].Weapon,
    },
  };

  allFilters[config.steam.games_id.DotA2].Rarity.sort();
  allFilters[config.steam.games_id.DotA2].Quality.sort();
  allFilters[config.steam.games_id.DotA2].Type.sort();
  allFilters[config.steam.games_id.DotA2].Slot.sort();
  allFilters[config.steam.games_id.DotA2].Hero.sort();
  allFilters[config.steam.games_id.CSGO].Rarity.sort();
  allFilters[config.steam.games_id.CSGO].Quality.sort();
  allFilters[config.steam.games_id.CSGO].Type.sort();
  allFilters[config.steam.games_id.CSGO].Weapon.sort();
  allFilters[config.steam.games_id.CSGO].ItemSet.sort();
  allFilters[config.steam.games_id.CSGO].Exterior.sort();
  allFilters[config.steam.games_id.TF2].Class.sort();
  allFilters[config.steam.games_id.TF2].Quality.sort();
  allFilters[config.steam.games_id.TF2].Type.sort();
  allFilters[config.steam.games_id.TF2].Weapon.sort();

  return {
    status: 'success',
    ...allFilters,
  };
};
