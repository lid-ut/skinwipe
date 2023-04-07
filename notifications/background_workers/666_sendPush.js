const apn = require('apn');
const FCM = require('fcm-node');
const config = require('../../config');
const PushQueue = require('../../src/models/PushQueue');
const FirebaseToken = require('../../src/models/FirebaseToken');
const User = require('../../src/models/User');

const fcmProvider = new FCM(config.firebaseKey);
const apnProvider = new apn.Provider({
  cert: `${__dirname}/../iosCert/cert.pem`,
  key: `${__dirname}/../iosCert/key.pem`,
  passphrase: 'SkinGe@@#77',
  production: true,
});

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
      payload: { extraData: pushData },
    };
  }
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

function sendIOS(pushData, token) {
  return new Promise(resolve => {
    if (pushData.event === 3) {
      resolve(token);
      return;
    }

    try {
      // resolve('expired');
      apnProvider.send(new apn.Notification(generateIOSPayload(pushData)), token).then(result => {
        if (result.failed instanceof Array && result.failed.length) {
          logger.info('[sendPush][sendIOS] fail: %j', result);
          resolve(false);
          return;
        }
        resolve(token);
      });
    } catch (e) {}
  });
}

module.exports = async callback => {
  await PushQueue.find({
    // steamId: '76561198054035851',
    $or: [{ sendDate: null }, { sendDate: { $lte: Date.now() } }],
  })
    .cursor()
    .eachAsync(
      async push => {
        const user = await User.findOne({ steamId: push.steamId }).populate('firebaseTokens');
        if (!user) {
          logger.error('[sendPush] no user %j', push.steamId);
          await PushQueue.deleteOne({ _id: push._id });
          return;
        }
        logger.warn(`[sendPush] Start for [${user.personaname}]`);

        if (!user.firebaseTokens || !user.firebaseTokens.length) {
          logger.info('[sendPush] no firebase token %j', user.personaname);
          await PushQueue.deleteOne({ _id: push._id });
          return;
        }

        if (!push.platforms || !push.platforms.length || push.platforms.indexOf('android') > -1) {
          for (let i = 0; i < user.firebaseTokens.length; i++) {
            const token = user.firebaseTokens[i];
            if (token.os_type === 'android') {
              // eslint-disable-next-line no-await-in-loop
              const success = await sendAndroid(push.pushData, token.token);
              if (!success) {
                // eslint-disable-next-line no-await-in-loop
                await FirebaseToken.deleteOne({ token: token.token });
              }
            }
          }
        }
        if (!push.platforms || !push.platforms.length || push.platforms.indexOf('ios') > -1) {
          for (let i = 0; i < user.firebaseTokens.length; i++) {
            const token = user.firebaseTokens[i];
            if (token.os_type === 'ios') {
              // eslint-disable-next-line no-await-in-loop
              const success = await sendIOS(push.pushData, token.token);
              if (!success) {
                // eslint-disable-next-line no-await-in-loop
                await FirebaseToken.deleteOne({ token: token.token });
              }
            }
          }
        }

        await PushQueue.deleteOne({ _id: push._id });
      },
      { parallel: 5 },
    );

  callback();
};
