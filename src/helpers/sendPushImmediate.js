const apn = require('apn');
const FCM = require('fcm-node');
// const OneSignal = require('onesignal-node');
const FirebaseToken = require('../models/FirebaseToken');
const config = require('../../config');

const fcmProvider = new FCM(config.firebaseKey);

let production = true;
if (process.env.NODE_ENV !== 'new-prod') {
  production = false;
}

const apnOptions = {
  cert: `${__dirname}/../../notifications/iosNewCerts/cert.pem`,
  key: `${__dirname}/../../notifications/iosNewCerts/key.pem`,
  passphrase: 'SkinGe@@#77',
  production,
};

// const oneSignalClient = new OneSignal.Client(config.oneSignal.appId, config.oneSignal.apiKey);

function generateAndroidPayload(pushData) {
  const payload = {
    event: pushData.event,
  };
  if (pushData.personaName) {
    payload.personaName = pushData.personaName;
    payload.personaname = pushData.personaName;
  }
  if (pushData.room) payload.room = pushData.room;
  if (pushData.json) payload.json = pushData.json;
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

function generateIOSPayload(pushData) {
  let payload = {
    aps: {
      'content-available': 1,
    },
    contentAvailable: true,
    payload: {
      extraData: {
        event: pushData.event,
      },
    },
  };
  if (pushData.event !== 1 && pushData.event !== 2 && pushData.event !== 6) {
    payload = {
      contentAvailable: true,
      mutableContent: true,
      topic: 'gg.skinswipe',
      expiry: Math.floor(Date.now() / 1000) + 3600, // Expires 1 hour from now.
      sound: pushData.sound,
      alert: pushData.alert,
      title: pushData.title,
      content: pushData.content,
      payload: { extraData: pushData },
    };
  }
  return payload;
}

function sendAndroid(pushData, token) {
  return new Promise(resolve => {
    const data = generateAndroidPayload(pushData);
    console.log({ data, to: token });
    fcmProvider.send({ data, to: token }, error => {
      console.log(error);
      if (error) {
        resolve(false);
        return;
      }
      resolve(token);
    });
  });
}

function sendIOS(pushData, token) {
  return new Promise(resolve => {
    const apnProvider = new apn.Provider(apnOptions);
    apnProvider.send(new apn.Notification(generateIOSPayload(pushData)), token).then(result => {
      if (result.failed instanceof Array && result.failed.length) {
        apnProvider.shutdown();
        resolve(false);
        return;
      }
      apnProvider.shutdown();
      resolve(token);
    });
  });
}

// function sendIOSThroughOneSignal(pushData, token) {
//   return new Promise(async function (resolve) {
//     const notification = {
//       contents: {
//         ru: pushData.content,
//         en: pushData.content,
//       },
//       headings: {
//         ru: pushData.title,
//         en: pushData.title,
//       },
//       include_ios_tokens: [token],
//       data: { extraData: pushData },
//     };
//
//     try {
//       await oneSignalClient.createNotification(notification);
//       resolve(token);
//     } catch (e) {
//       resolve(false);
//     }
//   });
// }

const sendImmediate = async (token, push) => {
  if (token.os_type.toLowerCase() === 'android') {
    const success = await sendAndroid(push.pushData, token.token);
    console.log(success);
    if (!success) {
      await FirebaseToken.updateOne({ token: token.token }, { $inc: { attempt: 1 } });
      // if (token.attempt >= 5) {
      //   await FirebaseToken.deleteOne({ token: token.token });
      // }
    }
  }
  if (token.os_type.toLowerCase() === 'ios') {
    const success = await sendIOS(push.pushData, token.token);
    if (!success) {
      await FirebaseToken.updateOne({ token: token.token }, { $inc: { attempt: 1 } });
      if (token.attempt >= 5) {
        await FirebaseToken.deleteOne({ token: token.token });
      }
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
    return { event: '19' };
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

module.exports = async function sendPushImmediate(token, data) {
  if (!token || !token.token || !token.steamId || token.steamId.length === 0) {
    logger.info('[sendPushV2] no user!');
    return;
  }
  const pushData = generatePushData(data);
  if (!pushData) {
    logger.error('[sendPushImmediate] invalid params: %j', data);
    return;
  }

  const pQ = { steamId: token.steamId, pushData };
  await sendImmediate(token, pQ);
};
