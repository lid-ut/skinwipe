const Trade = require('../../src/models/Trade');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();

  const trades = await Trade.find({
    autoTrade: { $ne: true },
    status: 'new',
    'notifications.created': { $ne: true },
  })
    .populate('user1 user2')
    .limit(100)
    .lean()
    .exec();

  for (let i = 0; i < trades.length; i++) {
    const trade = trades[i];

    // eslint-disable-next-line no-await-in-loop
    await sendPushV3(trade.user2, {
      type: 'TRADE_INFO',
      tradeId: trade._id,
      title: i18n((trade.user2.locale || 'en').toLowerCase()).trade.created.title,
      content: i18n((trade.user2.locale || 'en').toLowerCase()).trade.created.content.replace('{{1}}', trade.user1.personaname),
    });

    const notifications = trade.notifications || {};
    notifications.created = true;
    // eslint-disable-next-line no-await-in-loop
    await Trade.updateOne(
      { _id: trade._id },
      {
        $set: { notifications },
      },
    );
  }

  logger.info(`[081_newTradePush] end in ${Date.now() - startTime}ms`);
  callback();
};
