const User = require('../../models/User');

module.exports = async function process(req) {
  if (!req.body.tradeUrl || req.body.tradeUrl.indexOf('http') === -1) {
    logger.error(`incorrect tradeUrl: ${req.body.tradeUrl}`);
    return { status: 'error', error: 'tradeUrl is incorrect' };
  }
  if (req.body.tradeUrl.indexOf('&token') === -1) {
    if (req.user.tradeUrl && req.user.tradeUrl.length) {
      return { status: 'success', tradeUrl: req.user.tradeUrl };
    }
    logger.error(`incorrect tradeUrl: ${req.body.tradeUrl}`);
    return { status: 'error', error: 'tradeUrl is incorrect' };
  }

  // Очень блять важная замена. Серьёзно!
  req.body.tradeUrl = req.body.tradeUrl.replace(/"/g, '');

  await User.updateOne(
    { steamId: req.user.steamId },
    {
      $set: {
        tradeUrl: req.body.tradeUrl,
      },
    },
  );
  return { status: 'success', tradeUrl: req.body.tradeUrl };
};
