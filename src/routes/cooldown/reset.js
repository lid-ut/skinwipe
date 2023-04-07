const User = require('../../models/User');
const changeCoins = require('../../helpers/changeCoins');
const checkCoins = require('../../helpers/checkCoins');

module.exports = async function resetCooldown(req) {
  if (['auctionRiseCoolDown', 'profileRiseCoolDown', 'tradeRiseCoolDown'].indexOf(req.params.type) === -1) {
    return {
      status: 'error',
      code: 1,
    };
  }
  if (!(await checkCoins(req.user, 10))) {
    return {
      status: 'error',
      code: 2,
      message: 'Not enough coins',
    };
  }

  await changeCoins(req.user, 'cooldown', -10);
  if (req.params.type === 'auctionRiseCoolDown') {
    await User.updateOne({ _id: req.user._id }, { $set: { lastAuctionRise: 0 } });
  } else if (req.params.type === 'tradeRiseCoolDown') {
    await User.updateOne({ _id: req.user._id }, { $set: { lastTradeRise: 0 } });
  } else {
    await User.updateOne({ _id: req.user._id }, { $set: { lastProfileRise: 0 } });
  }
  return { status: 'success' };
};
