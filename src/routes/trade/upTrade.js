const Trade = require('../../models/Trade');
const User = require('../../models/User');
const checkCoins = require('../../helpers/checkCoins');
const addPaidStat = require('../../helpers/addPaidStat');
const changeCoins = require('../../helpers/changeCoins');
const config = require('../../../config');

module.exports = async req => {
  const trade = await Trade.findOne({ _id: req.params.tradeId });
  if (!trade) {
    return {
      status: 'error',
      code: 1,
      message: 'trade not found',
    };
  }

  if (!req.user.subscriber && !(await checkCoins(req.user, 10))) {
    return {
      status: 'error',
      code: 2,
      message: 'not enough money',
    };
  }

  if (req.user.subscriber) {
    let blockPeriod = Date.now() - 5 * 60 * 1000;
    if (!config.production) {
      blockPeriod = Date.now() - 60 * 1000;
    }
    if (new Date(req.user.lastTradeRise).getTime() > blockPeriod) {
      return {
        status: 'error',
        code: 3,
        message: 'rate limit',
      };
    }
  }

  if (!req.user.subscriber) {
    const reason = trade.autoTrade ? 'upSuperTrade' : 'upTrade';
    await addPaidStat(reason, 10);
    await changeCoins(req.user, reason, -10);
  } else {
    const reason = trade.autoTrade ? 'upSuperTradeFree' : 'upTradeFree';
    await addPaidStat(reason);
    await User.updateOne({ _id: req.user._id }, { $set: { lastTradeRise: Date.now() } });
  }

  trade.raisedAt = new Date();
  await trade.save();

  return { status: 'success' };
};
