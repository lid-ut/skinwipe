const Trade = require('../../src/models/Trade');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();
  const trades = await Trade.find({
    autoTrade: { $ne: true },
    status: 'reject',
    'notifications.rejected': { $ne: true },
  })
    .populate('user1 user2')
    .limit(100)
    .lean()
    .exec();

  for (let i = 0; i < trades.length; i++) {
    const trade = trades[i];

    if (trade.user1 && trade.user1.steamId !== trade.userClose) {
      const push18n =
        trade.userClose === 'auto'
          ? i18n((trade.user1.locale || 'en').toLowerCase()).trade.autoClosed
          : i18n((trade.user1.locale || 'en').toLowerCase()).trade.rejected;
      // eslint-disable-next-line no-await-in-loop
      await sendPushV3(trade.user1, {
        type: 'TRADE_INFO',
        title: push18n.title,
        content: push18n.content.replace('{{1}}', trade.user2 ? trade.user2.personaname : '%username%'),
        tradeId: trade._id,
      });
    }

    const notifications = trade.notifications || {};
    notifications.rejected = true;
    // eslint-disable-next-line no-await-in-loop
    await Trade.updateOne(
      { _id: trade._id },
      {
        $set: { notifications },
      },
    );
  }

  logger.info(`[082_tradeRejected] end in ${Date.now() - startTime}ms`);
  callback();
};
