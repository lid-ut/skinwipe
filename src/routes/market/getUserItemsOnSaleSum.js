const MarketItem = require('../../models/MarketItem');

module.exports = async (req, res) => {
  const items = await MarketItem.find({ steamid: req.user.steamId });
  let sum = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    sum += item.price.steam.mean;
  }

  res.json({
    status: 'success',
    result: sum,
  });
};
