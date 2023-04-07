const Trade = require('../../models/Trade');
const User = require('../../models/User');
const checkCoins = require('../../helpers/checkCoins');
const addPaidStat = require('../../helpers/addPaidStat');
const changeCoins = require('../../helpers/changeCoins');
const config = require('../../../config');

module.exports = async req => {
  const trades = await Trade.find({ steamId: req.user.steamId, autoTrade: true, status: 'new' }, { _id: 1 }).lean();
  if (!trades.length) {
    return {
      status: 'error',
      code: 1,
      message: 'no trades',
    };
  }

  let coinsNeeded = 10 * trades.length;
  let haveEnoughCoins = await checkCoins(req.user, coinsNeeded);

  if (req.user.subscriber) {
    let blockPeriod = Date.now() - 5 * 60 * 1000;
    if (!config.production) {
      blockPeriod = Date.now() - 60 * 1000;
    }
    if (trades.length && new Date(req.user.lastTradeRise).getTime() < blockPeriod) {
      coinsNeeded = 10 * (trades.length - 1);
    }
    haveEnoughCoins = await checkCoins(req.user, coinsNeeded);

    if (!haveEnoughCoins) {
      return {
        status: 'error',
        code: 2,
        message: 'not enough money',
      };
    }

    if (new Date(req.user.lastTradeRise).getTime() < blockPeriod) {
      await addPaidStat('upSuperTradeFree');
    }
    if (coinsNeeded > 0) {
      await addPaidStat('upSuperTrade', coinsNeeded);
      await changeCoins(req.user, 'upSuperTrade', coinsNeeded * -1);
    }
    await User.updateOne({ _id: req.user._id }, { $set: { lastTradeRise: Date.now() } });
  } else {
    if (!haveEnoughCoins) {
      return {
        status: 'error',
        code: 2,
        message: 'not enough money',
      };
    }
    await addPaidStat('upSuperTrade', coinsNeeded);
    await changeCoins(req.user, 'upSuperTrade', coinsNeeded * -1);
  }

  for (let i = 0; i < trades.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await Trade.updateOne({ _id: trades[i]._id }, { $set: { raisedAt: Date.now() } });
  }

  return {
    status: 'success',
    result: {
      trades: trades.length,
      coinsUsed: coinsNeeded,
    },
  };
};
