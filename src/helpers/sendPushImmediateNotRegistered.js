const apn = require('apn');
const FCM = require('fcm-node');
const OneSignal = require('onesignal-node');
const TempFirebaseToken = require('../models/TempFirebaseToken');
const config = require('../../config');

const fcmProvider = new FCM(config.firebaseKey);
const apnOptions = {
  cert: `${__dirname}/../../notifications/iosNewCerts/cert.pem`,
  key: `${__dirname}/../../notifications/iosNewCerts/key.pem`,
  passphrase: 'SkinGe@@#77',
  production: true,
};

const oneSignalClient = new OneSignal.Client(config.oneSignal.appId, config.oneSignal.apiKey);

function generateAndroidPayload(pushData) {
  const payload = {
    event: pushData.event,
  };
  if (pushData.personaName) {
    payload.personaName = pushData.personaName;
    payload.personaname = pushData.personaName;
  }
  if (pushData.room) payload.room = pushData.room;
  if (pushData.title) payload.title = pushData.title;
  if (pushData.content) payload.content = pushData.content;
  if (pushData.auctionId) payload.auctionId = pushData.auctionId;
  if (pushData.tradeId) payload.tradeId = pushData.tradeId;
  if (pushData.steamId) payload.steamId = pushData.steamId;
  if (pushData.assetId) payload.assetId = pushData.assetId;
  if (pushData.steamTradeInfo) payload.steamTradeInfo = pushData.steamTradeInfo;
  if (pushData.key) payload.key = pushData.key;
  if (pushData.value) payload.value = pushData.value;
  return payload;
}

function sendAndroid(pushData, token) {
  return new Promise(resolve => {
    fcmProvider.send({ data: generateAndroidPayload(pushData), to: token }, error => {
      if (error) {
        resolve(false);
        return;
      }
      resolve(token);
    });
  });
}

function sendIOSThroughOneSignal(pushData, token) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async function (resolve) {
    const notification = {
      contents: {
        ru: pushData.content,
        en: pushData.content,
      },
      headings: {
        ru: pushData.title,
        en: pushData.title,
      },
      include_ios_tokens: [token],
      data: { extraData: pushData },
    };

    try {
      await oneSignalClient.createNotification(notification);
      resolve(token);
    } catch (e) {
      resolve(false);
    }
  });
}

const sendImmediate = async (token, push) => {
  if (token.os_type.toLowerCase() === 'android') {
    const success = await sendAndroid(push.pushData, token.token);
    if (!success) {
      await TempFirebaseToken.deleteOne({ token: token.token });
    }
  }
  if (token.os_type.toLowerCase() === 'ios') {
    const success = await sendIOSThroughOneSignal(push.pushData, token.token);
    if (!success) {
      await TempFirebaseToken.deleteOne({ token: token.token });
    }
  }
};

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
    if (!pushData.tradeId || !pushData.steamTradeInfo) {
      return null;
    }
    return {
      event: '4',
      tradeId: pushData.tradeId,
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
    if (!pushData.title || !pushData.content || !pushData.assetId) {
      return null;
    }
    return {
      event: '14',
      sound: 'ping.aiff',
      alert: '3',
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

module.exports = async function sendPushImmediate(token, data) {
  if (!token || !token.token) {
    logger.info('[sendPushImmediateNotRegistered] no user!');
    return;
  }
  const pushData = generatePushData(data);

  if (!pushData) {
    logger.error('[sendPushImmediateNotRegistered] invalid params: %j', data);
    return;
  }

  await sendImmediate(token, { pushData });
};
