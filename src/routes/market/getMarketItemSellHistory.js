const MarketTrade = require('../../models/MarketTrade');

module.exports = async (req, res) => {
  const name = decodeURI(req.params.name);
  const history = [];
  const marketTrades = await MarketTrade.find(
    {
      direction: 'out',
      status: 'done',
      'itemsPartner.name': name,
    },
    {
      createdAt: 1,
      'itemsPartner.price.steam.mean': 1,
      'itemsPartner.name': 1,
    },
  )
    .sort({ cratedAt: -1 })
    .limit(20)
    .lean();

  // eslint-disable-next-line no-restricted-syntax
  for (const trade of marketTrades) {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of trade.itemsPartner) {
      if (item.name === name)
        history.push({
          date: trade.createdAt,
          price: item.price.steam.mean,
        });
    }
  }

  res.json({
    status: 'success',
    result: history,
  });
};
