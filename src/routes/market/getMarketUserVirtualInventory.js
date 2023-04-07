const getVirtualUserItems = require('../../helpers/getVirtualUserItems');
const getVirtualUserItemsCount = require('../../helpers/getVirtualUserItemsCount');

module.exports = async function getUserMarketInventory(req, res) {
  const limit = parseInt(req.params.limit, 10);
  const offset = parseInt(req.params.offset, 10);
  const virtualItems = await getVirtualUserItems(req.user.steamId, limit, offset, true);
  const virtualItemsCount = await getVirtualUserItemsCount(req.user.steamId, true);

  virtualItems.map(it => {
    it.price.steam.mean /= 100;
    it.price.steam.safe /= 100;
    it.price.steam.converted /= 100;
    it.price.steam.base /= 100;
    return it;
  });

  res.json({
    status: 'success',
    result: {
      items: virtualItems,
      count: virtualItemsCount,
    },
  });
};
