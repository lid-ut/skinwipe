const MarketTrade = require('../../../models/MarketTrade');

module.exports = async (req, res) => {
  const count = await MarketTrade.countDocuments({ status: { $in: ['wait', 'check'] }, seller: req.user.steamId });
  res.json({
    status: 'success',
    result: count,
  });
};
