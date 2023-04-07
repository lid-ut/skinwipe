const Trade = require('../../models/Trade');
const checkCoins = require('../../helpers/checkCoins');
const addPaidStat = require('../../helpers/addPaidStat');
const changeCoins = require('../../helpers/changeCoins');

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

  if (!req.user.subscriber) {
    await addPaidStat('markTradePremium', 10);
    await changeCoins(req.user, 'markTradePremium', -10);
  } else {
    await addPaidStat('markTradePremiumFree');
  }

  trade.premium = true;
  await trade.save();

  return { status: 'success' };
};
