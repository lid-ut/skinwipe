const sendPushV3 = require('../../helpers/sendPushV3');
const Transaction = require('../../models/Transaction');
const User = require('../../models/User');

module.exports = async function process(req, res) {
  if (!req.params || !req.params.steamId) {
    logger.warn(`[addCoins] error (data)`);
    return;
  }

  const user = await User.findOne({ steamId: req.params.steamId });
  if (!user) {
    logger.warn(`[addCoins] cannot find user`);
    res.json({ status: false });
    return;
  }

  const transaction = new Transaction({
    user_steam_id: user.steamId,
    usedEntity: 'coins',
    info: 'Пополнение на 50',
    amount: 50,
    token: 'supportChat',
  });
  await transaction.save();

  if (!user.coinCount) {
    user.coinCount = 0;
  }
  user.coinCount += 50;

  await User.updateOne({ _id: user._id }, { $set: { coinCount: user.coinCount } });
  await sendPushV3(user, { type: 'UPDATE_BALANCE' });

  res.json({ status: user.coinCount });
};
