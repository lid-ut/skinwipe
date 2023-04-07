const marketTradeStatus = require('../../../modules/market/trade/status');

module.exports = async (req, res) => {
  await marketTradeStatus(req.user, req.body.tradeId, req.body.info);

  res.json({
    status: 'success',
  });
};
