const Push = require('../models/Push');
const TempFirebaseToken = require('../models/TempFirebaseToken');
const sendPushImmediateNotRegistered = require('./sendPushImmediateNotRegistered');

const generatePushData = pushData => {
  if (!pushData || !pushData.type) {
    return null;
  }
  if (pushData.type === 'CHECK_WEB_VIEW') {
    return { event: '1' };
  }
  if (pushData.type === 'UPDATE_BALANCE') {
    return { event: '2' };
  }
  if (pushData.type === 'STEAM_TRADE_INFO') {
    if (!pushData.tradeId || !pushData.steamTradeInfo || !pushData.personaname) {
      return null;
    }
    return {
      event: '4',
      tradeId: pushData.tradeId,
      personaName: pushData.personaname,
      steamTradeInfo: pushData.steamTradeInfo,
      sound: 'ping.aiff',
      alert: '3',
    };
  }
  if (pushData.type === 'INFO') {
    if (!pushData.title || !pushData.content) {
      return null;
    }
    return {
      event: '7',
      title: pushData.title,
      content: pushData.content,
      sound: 'ping.aiff',
      alert: '3',
    };
  }
  if (pushData.type === 'TRADE_INFO') {
    if (!pushData.title || !pushData.content || !pushData.tradeId) {
      return null;
    }
    return {
      event: '10',
      sound: 'ping.aiff',
      alert: '3',
      tradeId: pushData.tradeId,
      title: pushData.title,
      content: pushData.content,
    };
  }
  if (pushData.type === 'AUCTION_INFO') {
    if (!pushData.title || !pushData.content || !pushData.auctionId) {
      return null;
    }
    return {
      event: '11',
      sound: 'ping.aiff',
      alert: '3',
      auctionId: pushData.auctionId,
      title: pushData.title,
      content: pushData.content,
    };
  }

  if (pushData.type === 'SKIN_INFO') {
    if (!pushData.title || !pushData.content || !pushData.steamId || !pushData.assetId) {
      return null;
    }
    return {
      event: '14',
      sound: 'ping.aiff',
      alert: '3',
      steamId: pushData.steamId,
      assetId: pushData.assetId,
      title: pushData.title,
      content: pushData.content,
    };
  }
  if (pushData.type === 'SPECIAL_OFFER_INFO') {
    if (!pushData.title || !pushData.content) {
      return null;
    }
    return {
      event: '15',
      sound: 'ping.aiff',
      alert: '3',
      title: pushData.title,
      content: pushData.content,
    };
  }
  return null;
};

module.exports = async function sendPushV3(user, data) {
  if (!user) {
    logger.info('[sendPushToNotRegistered] no user!');
    return;
  }
  logger.info(`[sendPushToNotRegistered] started for User ${user._id}`);
  const pushData = generatePushData(data);

  if (!pushData) {
    logger.error('[sendPushToNotRegistered] invalid params: %j', data);
    return;
  }

  const tokenQuery = { userId: user._id };
  if (data.platform) {
    tokenQuery.os_type = data.platform;
  }
  const tokens = await TempFirebaseToken.find(tokenQuery).lean();
  for (let i = 0; i < tokens.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await sendPushImmediateNotRegistered(tokens[i], data);
  }
};
