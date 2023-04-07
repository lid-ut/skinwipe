const purchaseService = require('in-app-purchase');

const User = require('../../models/User');
const Purchase = require('../../models/Purchase');
const config = require('../../../config');
const changeCoins = require('../../helpers/changeCoins');
const checkSubInfo = require('../../helpers/checkSubInfo');

const COINS_AMOUNT_FOR_PREMIUM_BONUS = 3999;
const PREMIUM_BONUS = 1;
const PREMIUM_MONTH_FOR_COINS_BONUS = 180;
const COINS_BONUS = 1000;

purchaseService.config(config.iap.settings);

const isSubscriptionIsNotExpired = subInfo => {
  const expirationDate = subInfo.expiration || subInfo.expirationTime || subInfo.expiresDateMs || 0;
  return expirationDate > Date.now();
};

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

const updatePurchase = async (data, steamId, token, success) => {
  const purchase = await Purchase.findOne({ steamId, token });
  if (purchase && !purchase.success) {
    purchase.data = data;
    purchase.success = success;
    await purchase.save();
  }
};

const createIOSSubInfo = (subInfo, receipt) => {
  return {
    createdAt: new Date(),
    bundleId: subInfo.bundleId,
    productId: subInfo.productId || subInfo.product_id,
    token: receipt,
    store: 'apple',

    dateCreate: new Date(),
    isTrial: subInfo.isTrial || subInfo.is_trial_period,
    isInIntroOfferPeriod: subInfo.isInIntroOfferPeriod || subInfo.is_in_intro_offer_period,
    quantity: subInfo.quantity,

    transactionId: subInfo.transactionId || subInfo.transaction_id,
    originalTransactionId: subInfo.originalTransactionId || subInfo.original_transaction_id,

    webOrderLineItemId: subInfo.webOrderLineItemId || subInfo.web_order_line_item_id,
    purchaseDate: subInfo.purchaseDate || subInfo.purchase_date,
    purchaseDateMs: subInfo.purchaseDateMs || subInfo.purchase_date_ms,
    purchaseDatePst: subInfo.purchaseDatePst || subInfo.purchase_date_pst,
    originalPurchaseDate: subInfo.originalPurchaseDate || subInfo.original_purchase_date,
    originalPurchaseDateMs: subInfo.originalPurchaseDateMs || subInfo.original_purchase_date_ms,
    originalPurchaseDatePst: subInfo.originalPurchaseDatePst || subInfo.original_purchase_date_pst,
    expiresDate: subInfo.expiresDate || subInfo.expires_date,
    expiresDateMs: subInfo.expiresDateMs || subInfo.expirationTime,
    expiresDatePst: subInfo.expiresDatePst || subInfo.expires_date_pst,
    expirationDate: subInfo.expirationDate || subInfo.expires_date,

    start: parseInt(subInfo.purchaseDateMs, 10),
    expiration: parseInt(subInfo.expiresDateMs || subInfo.expirationDate, 10),
  };
};

const validateIOSPurchase = async (receipt, productIds, steamId) => {
  await purchaseService.setup();
  if (!receipt) {
    logger.error('[validatePurchase] no receipt provided');
    return null;
  }

  let validatedData;
  try {
    validatedData = await purchaseService.validateOnce(receipt, config.iap.ios);
  } catch (error) {
    logger.error(`[validatePurchase] validateOnce error: ${JSON.stringify(error)}`);
    const purchase = await Purchase.findOne({ steamId, token: receipt });
    if (purchase && purchase.success && purchase.data && purchase.data instanceof Array) {
      return purchase.data.filter(i => productIds.indexOf(i.productId) !== -1);
    }
    if (purchase) {
      await setPurchaseError(steamId, receipt, error);
    }
    return null;
  }

  if (!validatedData) {
    logger.error('[validatePurchase] no validatedData');
    return null;
  }

  if (validatedData.receipt && validatedData.receipt.in_app) {
    logger.info(`[validatePurchase] inApp data: ${validatedData.receipt.in_app.length}`);
  }

  let data;
  try {
    data = await purchaseService.getPurchaseData(validatedData, { ignoreCanceled: true, ignoreExpired: true });
    logger.info(`[validatePurchase] getPurchaseData length: ${data.length}`);
  } catch (error) {
    logger.error(`[validatePurchase] getPurchaseData error: ${JSON.stringify(error)}`);
    const purchase = await Purchase.findOne({ steamId, token: receipt });
    if (purchase && purchase.success) {
      return purchase.data.filter(i => productIds.indexOf(i.productId) !== -1);
    }
    if (purchase) {
      await setPurchaseError(steamId, receipt, error);
    }
    return null;
  }

  if (!data || !data.length) {
    // logger.error('[validatePurchase] getPurchaseData: %j', data);
    // logger.error('[validatePurchase] validatedData: %j', validatedData);
    logger.error('[validatePurchase] no purchase data');
    return null;
  }

  const subs = data
    .filter(i => productIds.indexOf(i.productId) !== -1)
    .map(item => createIOSSubInfo(item, receipt))
    .filter(isSubscriptionIsNotExpired);

  logger.info(`[validatePurchase] subs length: ${data.length}`);
  await updatePurchase(data, steamId, receipt, true);
  return subs;
};

const savePurchase = async data => {
  const oldPurchase = await Purchase.findOne({ steamId: data.steamId, token: data.token });
  if (oldPurchase) return;
  const newPurchase = new Purchase({ success: false, iapErrors: [], ...data });
  await newPurchase.save();
};

const getSamePurchasesCount = async (steamId, token) => {
  const sameUserPurchase = await Purchase.findOne({ steamId, token });
  if (sameUserPurchase) {
    return { sameUser: true, count: 1 };
  }
  const count = await Purchase.countDocuments({ token });
  return { sameUser: false, count };
};

const subStartIOS = async (user, receipt, screen, data) => {
  if (!user.subInfo) {
    user.subInfo = [];
  }

  logger.info('[subStartIOS] user.subInfo before: %j', user.subInfo.length);
  logger.info('[subStartIOS] data before: %j', data.length);

  for (let i = 0; i < data.length; i++) {
    user.subInfo.push(data[i]);
    // eslint-disable-next-line no-await-in-loop
    await savePurchase({
      steamId: user.steamId,
      token: receipt,
      data: data[i],
    });
  }

  logger.info('[subStartIOS] new subInfo count: %j', user.subInfo.length);

  user.subInfo = user.subInfo.filter((item, pos, array) => {
    return array.map(mapItem => mapItem.transactionId).indexOf(item.transactionId) === pos;
  });

  await User.updateOne({ _id: user._id }, { $set: { subInfo: user.subInfo } });

  logger.info(`[subStartIOS] [${user.personaname}] user.subInfo count: ${user.subInfo.length}`);

  await checkSubInfo(user);
};

module.exports = async function process(req) {
  const sameTokens = await getSamePurchasesCount(req.user.steamId, req.body.receipt);
  if (sameTokens.count && !sameTokens.sameUser) {
    logger.error(`[userSubIOS] getSamePurchasesCount: sameTokenCount [${req.user.steamId}]`);
    return { status: 'error', message: 'domestic tokens only' };
  }
  if (!sameTokens.count) {
    await savePurchase({
      steamId: req.user.steamId,
      token: req.body.receipt,
      data: {},
    });
  }

  const data = await validateIOSPurchase(
    req.body.receipt,
    [
      'premium_30_trial_7_price_899_date_20181017',
      'premium_60_trial_0_price_299',
      'premium_180_trial_0_price_399',
      'premium_360_trial_0_price_649',
    ],
    req.user.steamId,
  );

  if (!data) {
    logger.error('[userSubIOS] IOSPurchasesController error');
    return { status: 'error', message: 'purchases not found' };
  }
  logger.info(`[userSubIOS] validatePurchase count: ${data.length}`);
  await subStartIOS(req.user, req.body.receipt, req.body.screen, data);

  const purchase = await Purchase.findOne({ steamId: req.user.steamId, token: req.body.receipt });

  const productId = purchase.data.length > 0 ? purchase.data[0].productId : purchase.data.productId;
  if (productId.match(new RegExp(`premium_${PREMIUM_MONTH_FOR_COINS_BONUS}`))) {
    // eslint-disable-next-line no-undef
    await changeCoins(req.user, req.body.receipt, COINS_BONUS);
  }
  return { status: 'success' };
};
