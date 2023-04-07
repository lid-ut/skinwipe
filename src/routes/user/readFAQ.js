const User = require('../../models/User');
const FireCoin = require('../../models/FireCoin');
// const changeCoins = require('../../helpers/changeCoins');
const addStat = require('../../helpers/addStat');

module.exports = async function readFAQ(req, res) {
  if (req.user.faqCoinsSent) {
    res.json({
      status: 'error',
      code: 1,
      message: 'coins already sent',
    });
    return;
  }
  await User.updateOne({ steamId: req.user.steamId }, { $set: { faqCoinsSent: true } });
  // await changeCoins(req.user, 'faq', 50);
  await new FireCoin({
    steamId: req.user.steamId,
    reason: 'faq',
    amount: 300,
    used: 0,
    expiration: Date.now() + 30 * 60 * 60 * 1000,
  }).save();
  await addStat('fireCoinsAdded', 300);

  /**
   * типы:
   * fireCoins - скинкоины
   * coins - монеты
   */
  res.json({
    status: 'success',
    result: {
      type: 'fireCoins',
      amount: 300,
    },
  });
};
