const Trade = require('../../models/Trade');
const checkCoins = require('../../helpers/checkCoins');
const config = require('../../../config');

module.exports = async req => {
  const trades = await Trade.find({ steamId: req.user.steamId, autoTrade: true, status: 'new' }, { _id: 1 }).lean();

  let coinsNeeded = 10 * trades.length;
  if (req.user.subscriber) {
    let blockPeriod = Date.now() - 5 * 60 * 1000;
    if (!config.production) {
      blockPeriod = Date.now() - 60 * 1000;
    }
    if (trades && new Date(req.user.lastTradeRise).getTime() < blockPeriod) {
      coinsNeeded = 10 * (trades.length - 1);
    }
    return {
      status: 'success',
      result: {
        trades,
        coinsNeeded,
        haveEnoughCoins: await checkCoins(req.user, coinsNeeded),
      },
    };
  }

  return {
    status: 'success',
    result: {
      trades,
      coinsNeeded,
      haveEnoughCoins: await checkCoins(req.user, coinsNeeded),
    },
  };
};
