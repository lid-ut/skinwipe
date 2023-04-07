const fetch = require('node-fetch');
const KassaIOSToken = require('../../models/KassaIOSToken');
// const Purchase = require('../../models/Purchase');
const config = require('../../../config');
const checkSubInfo = require('../../helpers/checkSubInfo');
const givePremium = require('../../helpers/givePremium');
const changeCoins = require('../../helpers/changeCoins');

const COINS_AMOUNT_FOR_PREMIUM_BONUS = 3999;
const PREMIUM_BONUS = 1;
const PREMIUM_MONTH_FOR_COINS_BONUS = 6;
const COINS_BONUS = 1000;

const getMonths = data => {
  let months = data.description.substr(data.description.indexOf('(') + 1);
  months = months.substr(0, months.indexOf(' '));
  months = parseInt(months, 10);
  return months;
};

const validateIOSKassaPurchase = async token => {
  if (!token) {
    logger.error('[validatePurchase] no token provided');
    return null;
  }

  // let YKresponse = await fetch(`https://${config.kassa.shopId}:${config.kassa.key}@payment.yandex.net/api/v3/payments/${token}`, {
  let YKresponse = await fetch(`https://${config.IOSKassa.shopId}:${config.IOSKassa.key}@api.yookassa.ru/v3/payments/${token}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!YKresponse || YKresponse.status !== 200) {
    logger.error(`[kassa][YA.response] status: ${YKresponse.status}`);
    const message = await YKresponse.text();
    logger.error(`[kassa][YA.response] status: ${message}`);
    return null;
  }

  const text = await YKresponse.text();
  if (text.indexOf('{') !== 0) {
    logger.error(`[kassa][YA.response] result text: ${text}`);
    return null;
  }
  YKresponse = JSON.parse(text);
  if (YKresponse.status !== 'succeeded') {
    logger.error(`[kassa][YA.response] not succeeded: ${text}`);
    return null;
  }
  return YKresponse;
};

module.exports = async function process(req) {
  const sameTokens = await KassaIOSToken.countDocuments({ id: req.body.token });
  if (sameTokens) {
    logger.error(`[subIOSKassa] this token already used [${req.user.steamId}]`);
    return { status: 'error', code: 0, message: 'this token already used' };
  }

  const token = new KassaIOSToken({ id: req.body.token, steamId: req.user.steamId, product: 'premium' });

  const data = await validateIOSKassaPurchase(req.body.token, req.user.steamId);
  if (!data) {
    logger.error('[subIOSKassa] purchase validation failed');
    return { status: 'error', code: 1, message: 'purchase validation failed' };
  }
  token.productCount = getMonths(data);
  if (!token.productCount) {
    logger.error('[subIOSKassa] no token.productCount');
    return { status: 'error', code: 2, message: 'cannot get months count' };
  }
  await token.save();
  await KassaIOSToken.updateOne({ id: req.body.token }, { $set: data });

  await givePremium(req.user, 'kassa-ios-premium', token.productCount, req.body.token);
  if (token.productCount == PREMIUM_MONTH_FOR_COINS_BONUS) {
    await changeCoins(req.user, req.body.token, COINS_BONUS);
  }
  await checkSubInfo(req.user);
  return { status: 'success' };
};
