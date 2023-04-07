const Trade = require('../../src/models/Trade');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();

  const trades = await Trade.find({
    autoTrade: { $ne: true },
    status: 'finished',
    'notifications.finished': { $ne: true },
    updatedAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
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
      title: i18n((trade.user2.locale || 'en').toLowerCase()).trade.finished.title,
      content: i18n((trade.user2.locale || 'en').toLowerCase()).trade.finished.content,
      tradeId: trade._id,
    });
    if (!(trade.user2.friends || []).find(fsid => fsid === trade.user1.steamId)) {
      // eslint-disable-next-line no-await-in-loop
      await sendPushV3(trade.user2, {
        type: 'TRADE_INFO',
        title: i18n((trade.user2.locale || 'en').toLowerCase()).trade.finishedRepeat.title.replace('{{1}}', trade.user1.personaname),
        content: i18n((trade.user2.locale || 'en').toLowerCase()).trade.finishedRepeat.content,
        tradeId: trade._id,
        sendDate: Date.now() + 5 * 60 * 1000,
      });
    }

    // eslint-disable-next-line no-await-in-loop
    await sendPushV3(trade.user1, {
      type: 'TRADE_INFO',
      title: i18n((trade.user1.locale || 'en').toLowerCase()).trade.finished.title,
      content: i18n((trade.user1.locale || 'en').toLowerCase()).trade.finished.content,
      tradeId: trade._id,
    });
    if (!(trade.user1.friends || []).find(fsid => fsid === trade.user2.steamId)) {
      // eslint-disable-next-line no-await-in-loop
      await sendPushV3(trade.user1, {
        type: 'TRADE_INFO',
        title: i18n((trade.user1.locale || 'en').toLowerCase()).trade.finishedRepeat.title.replace('{{1}}', trade.user2.personaname),
        content: i18n((trade.user1.locale || 'en').toLowerCase()).trade.finishedRepeat.content,
        tradeId: trade._id,
        sendDate: Date.now() + 5 * 60 * 1000,
      });
    }

    const notifications = trade.notifications || {};
    notifications.finished = true;
    // eslint-disable-next-line no-await-in-loop
    await Trade.updateOne(
      { _id: trade._id },
      {
        $set: { notifications },
      },
    );
  }

  logger.info(`[084_finishedTradePush] end in ${Date.now() - startTime}ms`);
  callback();
};
