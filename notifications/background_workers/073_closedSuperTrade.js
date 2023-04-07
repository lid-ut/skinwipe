const Trade = require('../../src/models/Trade');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

// 7.3. закрытый супер трейд -> closed: true
module.exports = async callback => {
  const startTime = Date.now();

  const trades = await Trade.find({
    autoTrade: true,
    status: 'reject',
    userClose: 'auto',
    'notifications.closed': { $ne: true },
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
      title: i18n((trade.user1.locale || 'en').toLowerCase()).superTrade.closed.title,
      content: i18n((trade.user1.locale || 'en').toLowerCase()).superTrade.closed.content,
    });

    const notifications = trade.notifications || {};
    notifications.closed = true;
    // eslint-disable-next-line no-await-in-loop
    await Trade.updateOne(
      { _id: trade._id },
      {
        $set: { notifications },
      },
    );
  }

  logger.info(`[073] end in ${Date.now() - startTime}ms`);
  callback();
};
