const MarketTrade = require('../../../models/MarketTrade');

module.exports = async (req, res) => {
  const trade = await MarketTrade.findOne({ _id: req.params.marketTradeId });
  if (!trade.code) {
    trade.code = trade._id;
  }
  if (trade && trade.status === 'check') {
    trade.status = 'wait';
  }

  if (trade.type === 'bot') {
    const buyer = `${trade.seller}`;
    trade.seller = trade.buyer;
    trade.buyer = buyer;
  }
  res.json({
    status: 'success',
    result: trade,
  });
};
