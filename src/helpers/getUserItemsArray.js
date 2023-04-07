const UserSteamItems = require('../models/UserSteamItems');
const getNameAndTag = require('./getNameAndTag');

module.exports = async function getUserItemsArray(steamId) {
  let items = await UserSteamItems.distinct('steamItems', { steamId }).lean();

  items = items.map(item => {
    if (item.appid === 730) {
      item.paintWear = item.float;
      if (item.float && item.float !== 'unavailable' && item.float !== 'wait...') {
        item.floatInt = Math.floor(parseFloat(item.paintWear) * 1000);
      }
      item.ExteriorMin = getNameAndTag(item).tag;
    }
    return item;
  });

  return items;
};
