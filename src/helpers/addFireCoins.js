const FireCoin = require('../models/FireCoin');

const addStat = require('./addStat');

module.exports = async (steamId, amount, expiration, reason) => {
  await new FireCoin({
    steamId,
    reason,
    amount,
    used: 0,
    expiration,
  }).save();
  await addStat('fireCoinsAdded', amount);
};
