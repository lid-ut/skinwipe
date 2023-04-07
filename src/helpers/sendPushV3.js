const Push = require('../models/Push');
const FirebaseToken = require('../models/FirebaseToken');
const sendPushImmediate = require('./sendPushImmediate');

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

  if (pushData.type === 'UPDATE_MONEY_BALANCE') {
    return { event: '18' };
  }

  if (pushData.type === 'UPDATE_MARKET_INVENTORY') {
    return { event: '20' };
  }

  if (pushData.type === 'USER_INFO') {
    if (!pushData.title || !pushData.content || !pushData.steamId) {
      return null;
    }
    return {
      event: '21',
      sound: 'ping.aiff',
      alert: '3',
      steamId: pushData.steamId,
      title: pushData.title,
      content: pushData.content,
    };
  }

  if (pushData.type === 'MARKET_FILTER') {
    if (!pushData.title || !pushData.json) {
      return null;
    }
    return {
      event: '22',
      sound: 'ping.aiff',
      alert: '3',
      steamId: pushData.steamId,
      title: pushData.title,
      json: pushData.json,
    };
  }
  return null;
};

module.exports = async function sendPushV3(user, data, dontSave = false) {
  if (!user || !user.steamId || user.steamId.length === 0) {
    return;
  }

  const pushData = generatePushData(data);
  if (!pushData) {
    return;
  }

  // if (!dontSave) {
  //   // await new Push({ steamId: user.steamId, payload: data }).save();
  // }

  try {
    const tokenQuery = { steamId: user.steamId };
    if (data.platform) {
      tokenQuery.os_type = data.platform.toLowerCase();
    }
    const tokens = await FirebaseToken.find(tokenQuery).lean();
    for (let i = 0; i < tokens.length; i++) {
      console.log(tokens[i]);
      // eslint-disable-next-line no-await-in-loop
      await sendPushImmediate(tokens[i], data);
    }
  } catch (e) {
    e.toString();
  }
};
