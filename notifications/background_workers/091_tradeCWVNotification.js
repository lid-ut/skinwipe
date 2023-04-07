const User = require('../../src/models/User');
const Trade = require('../../src/models/Trade');
const MessageTrade = require('../../src/models/MessageTrade');
const sendPushV3 = require('../../src/helpers/sendPushV3');

async function processTrade(trade) {
  const payload = {
    type: 'CHECK_WEB_VIEW',
  };
  if (trade.steamTradeStatus === 'sent') {
    payload.steamId = trade.steamId;
  }
  if (trade.steamTradeStatus === 'received') {
    payload.steamId = trade.steamIdPartner;
  }

  if (!new Date(trade.steamLastSendPushCheck)) {
    logger.info(`[tradeCWVNotification] create date ${trade.steamLastSendPushCheck}`);
    trade.steamLastSendPushCheck = Date.now();
  }
  const user = await User.findOne({ steamId: payload.steamId }).lean();
  await sendPushV3(user, payload, true);
  // logger.info('[tradeCWVNotification] push was sent');

  if (!trade.notifications) {
    trade.notifications = {};
  }
  trade.notifications.accept = true;
  trade.steamSendPushCount = (trade.steamSendPushCount || 0) + 1;
  trade.steamLastSendPushCheck = Date.now();
  await trade.save();
}

module.exports = async callback => {
  await Trade.find({
    createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
    status: 'accepted',
    steamTradeStatus: { $in: ['sent', 'received'] },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .cursor()
    .eachAsync(
      async trade => {
        await processTrade(trade);
      },
      { parallel: 50 },
    );

  callback();
};
