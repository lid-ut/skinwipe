const MarketTrade = require('../../../models/MarketTrade');

module.exports = async (req, res) => {
  const trades = await MarketTrade.find({
    $or: [{ status: 'wait' }, { createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } }],
    buyer: req.user.steamId,
  }).sort({ createdAt: -1 });

  res.json({
    status: 'success',
    result: trades,
  });
};
