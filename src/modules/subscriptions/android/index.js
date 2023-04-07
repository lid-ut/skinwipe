const purchaseService = require('in-app-purchase');
const Purchase = require('../../../models/Purchase');
const User = require('../../../models/User');
const sendPushV3 = require('../../../helpers/sendPushV3');
const i18n = require('../../../languages');

const config = require('../../../../config');

purchaseService.config(config.iap.settings);

const setPurchaseError = async (steamId, token, error) => {
  const purchase = await Purchase.findOne({ steamId, token });
  if (!purchase) {
    return;
  }
  if (!purchase.iapErrors) {
    purchase.iapErrors = [];
  }
  purchase.iapErrors.push({
    date: new Date(),
    message: JSON.stringify(error),
  });
  await purchase.save();
};

const validateAndroidSub = async (JSONdata, signature, purchaseToken, steamId) => {
  await purchaseService.setup();

  const receipt = { data: JSONdata, signature };

  let result;
  try {
    result = await purchaseService.validateOnce(receipt, config.iap.android);
  } catch (error) {
    logger.error(`[validateSub] validate error: ${JSON.stringify(error)}`);
    const purchase = await Purchase.findOne({ steamId, token: purchaseToken });
    if (purchase && purchase.success) {
      return purchase.data;
    }
    if (purchase) {
      await setPurchaseError(steamId, purchaseToken, error);
    }
  }
  return result;
};

const updatePurchaseAndroid = async (data, steamId, token, success) => {
  const purchase = await Purchase.findOne({ steamId, token });
  if (!purchase) {
    return;
  }
  // eslint-disable-next-line no-restricted-globals
  if (data.cancelReason === undefined && purchase.data.orderId === data.orderId) {
    return;
  }
  purchase.success = success;

  if (data.expiration < Date.now()) {
    purchase.data.cancelReason = 1;
    purchase.status = 'ended';
    await purchase.save();
    return;
  }
  purchase.data = data;
  if (data.cancelReason === undefined) {
    if (data.productId.indexOf('trial') === -1) {
      purchase.status = 'paid';
    } else {
      const string1 = data.productId.replace('com.mezmeraiz.skinswipe.', '');
      const match = string1.split('.');
      const days = parseInt(match[1].replace('trial', ''), 10);

      purchase.status = data.expiration + (days + 7) * 24 * 60 * 60 * 1000 < Date.now() ? 'paid' : 'trial';
    }
  } else {
    purchase.status = 'canceled';
    if (data.productId.indexOf('trial') === -1) {
      let lastChanceDate = parseInt(data.startTimeMillis, 10) + 3 * 24 * 60 * 60 * 1000;
      if (data.productId === 'com.mezmeraiz.skinswipe.premium1m.trial3') {
        lastChanceDate = parseInt(data.startTimeMillis, 10) + 3 * 24 * 60 * 60 * 1000;
      }
      if (data.productId === 'com.mezmeraiz.skinswipe.premium12m.trial7') {
        lastChanceDate = parseInt(data.startTimeMillis, 10) + 7 * 24 * 60 * 60 * 1000;
      }
      const user = await User.findOne({ steamId: purchase.steamId });
      await User.updateOne(
        { _id: user._id },
        {
          showTrialCancelledSpecialOffer: true,
          trialCancelledSpecialOfferLastChance: new Date(lastChanceDate),
        },
      );

      // eslint-disable-next-line no-await-in-loop
      await sendPushV3(user, {
        type: 'INFO',
        title: i18n((user.locale || 'en').toLowerCase()).inactiveUser.twoDaysAfterInactive.title,
        content: i18n((user.locale || 'en').toLowerCase()).inactiveUser.twoDaysAfterInactive.content,
      });
    }
  }
  await purchase.save();
};

module.exports = async (user, sub) => {
  if (!sub.JSONdata || !sub.signature) {
    logger.error('[checkSubAndroid] no JSONdata!');
    return null;
  }

  const data = await validateAndroidSub(sub.JSONdata, sub.signature, sub.token, user.steamId);
  if (data) {
    sub.orderId = data.orderId;
    sub.packageName = data.packageName;
    sub.productId = data.productId;
    sub.purchaseTime = data.purchaseTime;
    sub.purchaseState = data.purchaseState;
    sub.purchaseToken = data.purchaseToken;
    sub.autoRenewing = data.autoRenewing;
    sub.status = data.status;
    sub.kind = data.kind;
    sub.startTimeMillis = data.startTimeMillis;
    sub.expiryTimeMillis = data.expiryTimeMillis;
    sub.priceCurrencyCode = data.priceCurrencyCode;
    sub.priceAmountMicros = data.priceAmountMicros;
    sub.countryCode = data.countryCode;
    sub.developerPayload = data.developerPayload;
    sub.paymentState = data.paymentState;
    sub.purchaseType = data.purchaseType;
    sub.service = data.service;
    sub.expirationTime = data.expirationTime;
    sub.cancelReason = data.cancelReason;

    data.start = parseInt(data.purchaseTime, 10);
    data.expiration = parseInt(data.expirationTime, 10);
    sub.start = parseInt(data.purchaseTime, 10);
    sub.expiration = parseInt(data.expirationTime, 10);

    await updatePurchaseAndroid(data, user.steamId, data.purchaseToken, true);
  } else {
    logger.error('[checkSubAndroid] no data!');
    return null;
  }
  return sub;
};
