const purchaseService = require('in-app-purchase');

const Transaction = require('../../models/Transaction');
const Purchase = require('../../models/Purchase');
const UserController = require('../../controllers/UserController');
const changeCoins = require('../../helpers/changeCoins');
const givePremium = require('../../helpers/givePremium');
const discord = require('../../../discord');
const config = require('../../../config');

const COINS_AMOUNT_FOR_PREMIUM_BONUS = 3999;
const PREMIUM_BONUS = 1;
const PREMIUM_MONTH_FOR_COINS_BONUS = 6;
const COINS_BONUS = 1000;

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

const updatePurchase = async (data, steamId, token, success) => {
  const purchase = await Purchase.findOne({ steamId, token });
  if (purchase && !purchase.success) {
    purchase.data = data;
    purchase.success = success;
    await purchase.save();
  }
};

const validatePurchase = async (receipt, productIds, steamId) => {
  await purchaseService.setup();
  if (!receipt) {
    logger.error('[validatePurchase] no receipt provided');
    return { err: 'no receipt provided', data: null };
  }

  let validatedData;
  try {
    validatedData = await purchaseService.validateOnce(receipt, config.iap.ios);
  } catch (error) {
    logger.error(`[validatePurchase] validateOnce error: ${JSON.stringify(error)}`);
    const purchase = await Purchase.findOne({ steamId, token: receipt });
    if (purchase && purchase.success && purchase.data && purchase.data instanceof Array) {
      const subs = purchase.data.filter(i => productIds.indexOf(i.productId) !== -1);
      return { err: null, data: subs };
    }
    if (purchase) {
      await setPurchaseError(steamId, receipt, error);
    }
    return { err: 'error', data: null };
  }

  if (!validatedData) {
    logger.error('[validatePurchase] no validatedData');
    return { err: 'cannot validate data', data: null };
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
      const subs = purchase.data.filter(i => productIds.indexOf(i.productId) !== -1);
      return { err: null, data: subs };
    }
    if (purchase) {
      await setPurchaseError(steamId, receipt, error);
    }
    return { err: 'error', data: null };
  }

  if (!data || !data.length) {
    // logger.error('[validatePurchase] getPurchaseData: %j', data);
    // logger.error('[validatePurchase] validatedData: %j', validatedData);
    logger.error('[validatePurchase] no purchase data');
    return { err: 'no purchase data', data: null };
  }

  const subs = data.filter(i => productIds.indexOf(i.productId) !== -1);
  logger.info(`[validatePurchase] subs length: ${data.length}`);
  await updatePurchase(data, steamId, receipt, true);
  return { err: null, data: subs };
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

module.exports = async function process(req, res) {
  const sameTokens = await getSamePurchasesCount(req.user.steamId, req.body.receipt);
  if (sameTokens.count) {
    logger.error(`[userPurchaseIOS] getSamePurchasesCount: sameTokenCount [${req.user.steamId}]`);
    res.json({
      status: 'error',
      message: 'domestic tokens only',
    });
    return;
  }
  await savePurchase({
    steamId: req.user.steamId,
    token: req.body.receipt,
    data: {},
  });
  req.body.coinCount = parseInt(req.body.coinCount, 10);

  // Black Friday Coins
  // let startDate = 1575018000000;
  // let endDate = 1575277200000;
  // if (Date.now() > startDate && Date.now() < endDate) {
  //   req.body.coinCount *= 2;
  // }
  // New Year Coins
  // startDate = 1577664000000;
  // endDate = 1579564799000;
  // if (Date.now() > startDate && Date.now() < endDate) {
  //   req.body.coinCount *= 2;
  // }
  // 23 Febrary - 9th March Coins
  // startDate = 1582329600000;
  // endDate = 1583712000000;
  // if (Date.now() > startDate && Date.now() < endDate) {
  // }
  // req.body.coinCount *= 4;
  const coinsMap = {
    75: 1000,
    455: 2000,
    2000: 3999,
    11000: 4000,
  };
  if (!coinsMap[req.body.coinCount]) {
    discord({ message: `[userPurchaseIOS][${req.user.steamId}][${req.body.coinCount}] coins not mapped!` });
  } else {
    req.body.coinCount = coinsMap[req.body.coinCount];
  }

  const { err, data } = await validatePurchase(req.body.receipt, ['coin_75', 'coin_455', 'coin_2000', 'coin_11000'], req.user.steamId);
  if (err || !data || data.length < 1) {
    logger.error('[userPurchaseIOS][validatePurchase] err:', { err });
    res.json({
      status: 'error',
      message: 'purchases not found',
    });
    return;
  }

  await UserController.changeTopPoints(req.user.steamId, config.topSettings.buyCoinMultiplier * req.body.coinCount, {
    action: 'buyCoins',
    steamId: req.user.steamId,
    partnerSteamId: null,
    amount: config.topSettings.buyCoinMultiplier * req.body.coinCount,
  });
  // await discord({ message: `[ios] new coins purchase: ${req.user.personaname} [${req.user.steamId}] [+${req.body.coinCount}]` });

  const tokens = (await Transaction.find({ user_steam_id: req.user.steamId }).lean()).map(transaction => transaction.token);
  if (!tokens) {
    logger.error('[userPurchaseIOS][Transaction.find] no tokens!');
    res.json({
      status: 'error',
      message: 'purchases not found',
    });
    return;
  }

  const tokenPromises = data
    .filter(pay => {
      return tokens.indexOf(pay.originalTransactionId) === -1;
    })
    .map(async pay => {
      if (req.body.coinCount === COINS_AMOUNT_FOR_PREMIUM_BONUS) {
        await givePremium(req.user, 'kassa-premium', PREMIUM_BONUS, pay.originalTransactionId);
      }
      return changeCoins(req.user, pay.originalTransactionId, req.body.coinCount);
    });

  await Promise.all(tokenPromises).catch();

  res.json({ status: 'success' });
};
