const SteamItem = require('../../models/SteamItem');
const config = require('../../../config');

module.exports = async function run() {
  const promises = await Promise.all([
    SteamItem.distinct('Rarity', {
      appid: config.steam.games_id.DotA2.toString(),
      usersCount: { $gt: 0 },
    }),
    SteamItem.distinct('Quality', {
      appid: config.steam.games_id.DotA2.toString(),
      usersCount: { $gt: 0 },
    }),
    SteamItem.distinct('Hero', {
      appid: config.steam.games_id.DotA2.toString(),
      usersCount: { $gt: 0 },
    }),
    SteamItem.distinct('Type', {
      appid: config.steam.games_id.DotA2.toString(),
      usersCount: { $gt: 0 },
    }),
    SteamItem.distinct('Slot', {
      appid: config.steam.games_id.DotA2.toString(),
      usersCount: { $gt: 0 },
    }),

    SteamItem.distinct('Rarity', {
      appid: config.steam.games_id.CSGO.toString(),
      usersCount: { $gt: 0 },
    }),
    SteamItem.distinct('Quality', {
      appid: config.steam.games_id.CSGO.toString(),
      usersCount: { $gt: 0 },
    }),
    SteamItem.distinct('Type', {
      appid: config.steam.games_id.CSGO.toString(),
      usersCount: { $gt: 0 },
    }),
    SteamItem.distinct('Weapon', {
      appid: config.steam.games_id.CSGO.toString(),
      usersCount: { $gt: 0 },
    }),
    SteamItem.distinct('ItemSet', {
      appid: config.steam.games_id.CSGO.toString(),
      usersCount: { $gt: 0 },
    }),
    SteamItem.distinct('Exterior', {
      appid: config.steam.games_id.CSGO.toString(),
      usersCount: { $gt: 0 },
    }),
  ]);
  const allFilters = {
    [config.steam.games_id.DotA2]: {
      Rarity: promises[0],
      Quality: promises[1],
      Hero: promises[2],
      Type: promises[3],
      Slot: promises[4],
    },
    [config.steam.games_id.CSGO]: {
      Rarity: promises[5],
      Quality: promises[6],
      Type: promises[7],
      Weapon: promises[8],
      ItemSet: promises[9],
      Exterior: promises[10],
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

  return {
    status: 'success',
    ...allFilters,
  };
};
