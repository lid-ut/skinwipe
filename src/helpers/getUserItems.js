const UserSteamItems = require('../models/UserSteamItems');
const filterItems = require('./filterItems');

module.exports = async function getUserItems(params) {
  const limit = params.limit || 0;
  const offset = params.offset || 0;
  if (!limit) {
    return [];
  }
  const query = { steamId: params.user.steamId };

  const userItems = await UserSteamItems.find(query).lean();

  return filterItems(params.user, userItems, params.filters, offset, limit).result || [];
};
