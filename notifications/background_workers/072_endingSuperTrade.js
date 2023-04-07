const Trade = require('../../src/models/Trade');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

// 7.2. через 6 дней - дописать notifications -> ending: true
module.exports = async callback => {
  const startTime = Date.now();

  const trades = await Trade.find({
    autoTrade: true,
    status: 'new',
    'notifications.ending': { $ne: true },
    createdAt: { $lte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
  })
    .populate('user1')
    .lean()
    .exec();

  for (let i = 0; i < trades.length; i++) {
    const trade = trades[i];

    // eslint-disable-next-line no-await-in-loop
    await sendPushV3(trade.user1, {
      type: 'TRADE_INFO',
      tradeId: trade._id,
      title: i18n((trade.user1.locale || 'en').toLowerCase()).superTrade.ending.title,
      content: i18n((trade.user1.locale || 'en').toLowerCase()).superTrade.ending.content,
    });

    const notifications = trade.notifications || {};
    notifications.ending = true;
    // eslint-disable-next-line no-await-in-loop
    await Trade.updateOne(
      { _id: trade._id },
      {
        $set: { notifications },
      },
    );
  }

  logger.info(`[072] end in ${Date.now() - startTime}ms`);
  callback();
};
