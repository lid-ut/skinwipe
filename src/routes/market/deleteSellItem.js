const MarketItem = require('../../models/MarketItem');

module.exports = async function sellItems(req, res) {
  await MarketItem.deleteOne({ appid: req.body.appid, assetid: req.body.assetid, steamid: req.user.steamId });
  res.json({
    status: 'success',
  });
};
