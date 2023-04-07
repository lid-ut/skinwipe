const MarketTrade = require('../../../models/MarketTrade');

module.exports = async (req, res) => {
  const offset = ((parseInt(req.params.page, 10) || 1) - 1) * 30;

  const trades = await MarketTrade.find({
    buyer: req.user.steamId,
    direction: req.params.direction,
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .skip(offset);

  res.json({
    status: 'success',
    result: trades,
  });
};
