const FireCoin = require('../models/FireCoin');

module.exports = async function checkCoins(user, count) {
  if (user.coinCount >= count) {
    return true;
  }

  const fireCoins = (
    await FireCoin.find({
      steamId: user.steamId,
      expiration: { $gte: Date.now() },
    })
  ).reduce((sum, cur) => (sum || 0) + cur.amount - cur.used, 0);

  return fireCoins + user.coinCount >= count;
};
