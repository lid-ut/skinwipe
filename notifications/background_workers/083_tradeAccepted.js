const Trade = require('../../src/models/Trade');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();
  const trades = await Trade.find({
    autoTrade: { $ne: true },
    status: 'accepted',
    'notifications.accepted': { $ne: true },
  })
    .populate('user1 user2')
    .limit(100)
    .lean()
    .exec();

  for (let i = 0; i < trades.length; i++) {
    const trade = trades[i];

    // eslint-disable-next-line no-await-in-loop
    await sendPushV3(trade.user1, {
      type: 'TRADE_INFO',
      title: i18n((trade.user1.locale || 'en').toLowerCase()).trade.accepted.title.replace('{{name}}', trade.user2.personaname),
      content: i18n((trade.user1.locale || 'en').toLowerCase()).trade.accepted.content,
      tradeId: trade._id,
    });

    const notifications = trade.notifications || {};
    notifications.accepted = true;
    // eslint-disable-next-line no-await-in-loop
    await Trade.updateOne(
      { _id: trade._id },
      {
        $set: { notifications },
      },
    );
  }

  logger.info(`[083_tradeAccepted] end in ${Date.now() - startTime}ms`);
  callback();
};
