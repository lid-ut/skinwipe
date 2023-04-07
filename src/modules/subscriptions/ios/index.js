const purchaseService = require('in-app-purchase');
const Purchase = require('../../../models/Purchase');

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

const isSubscriptionIsNotExpired = subInfo => {
  const expirationDate = subInfo.expiration || subInfo.expirationTime || subInfo.expiresDateMs || 0;
  return expirationDate > Date.now();
};

const updatePurchaseIos = async (data, steamId, token, success) => {
  const purchase = await Purchase.findOne({ steamId, token });
  if (!purchase) {
    return;
  }

  purchase.success = success;
  purchase.data = data;
  await purchase.save();
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
  await updatePurchaseIos(data, steamId, receipt, true);
  return subs;
};

module.exports = async (user, sub) => {
  const data = await validateIOSPurchase(
    sub.token,
    [
      'premium_30_trial_7_price_899_date_20181017',
      'premium_60_trial_0_price_299',
      'premium_180_trial_0_price_399',
      'premium_360_trial_0_price_649',
    ],
    user.steamId,
  );

  if (!data) {
    logger.error('[validateIOS] no data');
    return null;
  }

  return sub;
};
