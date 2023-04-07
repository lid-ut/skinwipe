const myInventory = require('../inventory/myInventory');
const getUserMarketItems = require('../../modules/market/items/getUserItems');
const updateUserItems = require('../../modules/inventory/update');

module.exports = async function getUserMarketInventory(req, res) {
  if (req.user.marketBan) {
    res.json({
      status: 'error',
      code: 1,
      unbanDate: new Date(req.user.marketBanTime).getTime(),
      message: new Date(req.user.marketBanTime),
      result: null,
    });
    return;
  }

  let updateres = {};
  const userInvOld = Date.now() - req.user.lastSteamItemsUpdate.getTime() > 15 * 1000;
  if (req.body.web && !req.body.cacheOnly && userInvOld) {
    updateres = await updateUserItems.update(req.user);
  }

  if (req.params.page) {
    req.params.limit = 20;
    req.params.offset = (req.params.page - 1) * 20;
  }

  delete req.body.filters.dota2;
  delete req.body.filters.tf2;

  if (!req.body.filters.csgo) {
    req.body.filters.csgo = {};
  }

  req.virtual = true;
  const result = await myInventory(req);
  const items = await getUserMarketItems(req.user, result.result.items);

  if (req.body.web) {
    res.json({
      status: 'success',
      items,
      update: updateres,
    });
    return;
  }
  res.json({
    status: 'success',
    result: items,
  });
};
