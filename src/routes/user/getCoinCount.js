const FireCoin = require('../../models/FireCoin');

module.exports = async function process(req) {
  const fireCoins = (
    await FireCoin.find({
      steamId: req.user.steamId,
      expiration: { $gte: Date.now() },
    })
  ).reduce((sum, cur) => (sum || 0) + cur.amount - cur.used, 0);
  return {
    coinCount: req.user.coinCount || 0,
    fireCoins,
  };
};
