const accept = require('../../../src/modules/market/trade/steam/accept');
const MarketTrade = require('../../../src/models/MarketTrade');

module.exports = async () => {
  const trades = await MarketTrade.find({ type: 'bot', status: 'check', steamTradeId: { $ne: null } });
  // const trades = await MarketTrade.find({_id: "60ffbb9e8e61cb2f8171b34d"});
  // eslint-disable-next-line no-restricted-syntax
  for (const trade of trades) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await accept(trade);
    } catch (e) {
      console.log(e.toString());
    }
  }
};
