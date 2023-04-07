const MarketItem = require('../../models/MarketItem');

module.exports = async function sellItems(req, res) {
  await MarketItem.deleteMany({ assetid: { $in: req.body.assetids }, steamid: req.user.steamId });
  res.json({
    status: 'success',
  });
};
