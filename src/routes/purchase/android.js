const purchaseService = require('in-app-purchase');

const UserController = require('../../controllers/UserController');
const Transaction = require('../../models/Transaction');
const Purchase = require('../../models/Purchase');
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

const validatePurchase = async (JSONdata, signature, steamId, jdata) => {
  const receipt = {
    data: JSONdata,
    signature,
  };

  await purchaseService.setup();

  let validatedData;
  try {
    validatedData = await purchaseService.validate(receipt);
  } catch (error) {
    if (error.indexOf('Status:410') > -1) {
      logger.info('[recheckPremium] Expired!');
      return null;
    }
    // todo: {"error":{},"status":1,"message":"PurchaseCanceled"} - если покупка монет с таким ответом, это рефанд
    logger.error(`[validatePurchase] validate error: ${error}`);
    const purchase = await Purchase.findOne({ steamId, token: jdata.purchaseToken });
    if (purchase && purchase.success) {
      return purchase.data;
    }
    if (purchase) {
      await setPurchaseError(steamId, jdata.purchaseToken, error);
    }
    return null;
  }

  if (!validatedData) {
    logger.error('[validatePurchase] no validatedData');
    return null;
  }

  // Это когда юзер отменил подписку, но она может быть ещё активна
  // if (validatedData.userCancellationTimeMillis) {
  //   logger.error('[validatePurchase] expired! (userCancellationTimeMillis)');
  //   return null;
  // }

  let purchaseData;
  try {
    purchaseData = await purchaseService.getPurchaseData(validatedData);
  } catch (error) {
    logger.error(`[validatePurchase] getPurchaseData error: ${JSON.stringify(error)}`);
    const purchase = await Purchase.findOne({ steamId, token: jdata.purchaseToken });
    if (purchase && purchase.success) {
      return purchase.data;
    }
    if (purchase) {
      await setPurchaseError(steamId, jdata.purchaseToken, error);
    }
    return null;
  }

  if (!purchaseData) {
    logger.error('[validatePurchase] no purchaseData');
    return null;
  }

  const jsobject = purchaseData[0];

  if (!jsobject || jsobject.purchaseState !== 0) {
    logger.error('[validatePurchase] no jsobject');
    return null;
  }

  await updatePurchase(jsobject, steamId, jsobject.purchaseToken, true);
  return jsobject;
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
  let jdata;
  try {
    jdata = JSON.parse(req.body.JSONdata);
    // logger.error('[userPurchaseAndroid] JSONdata parsing success');
  } catch (e) {
    logger.error(`[userPurchaseAndroid] JSONdata parsing filed: ${e}`);
    res.json({
      status: 'error',
      message: 'JSONdata is invalid',
    });
    return;
  }

  if (!jdata.purchaseToken) {
    res.json({
      status: 'error',
      message: 'no purchaseToken',
    });
    return;
  }

  const sameTokens = await getSamePurchasesCount(req.user.steamId, jdata.purchaseToken);
  if (!sameTokens.sameUser && sameTokens.count) {
    logger.error(`[userPurchaseAndroid] getSamePurchasesCount: sameTokenCount [${req.user.steamId}] [${jdata.purchaseToken}]`);
    res.json({
      status: 'error',
      message: 'domestic tokens only',
    });
    return;
  }

  await savePurchase({
    steamId: req.user.steamId,
    token: jdata.purchaseToken,
    data: jdata,
    JSONdata: req.body.JSONdata,
    signature: req.body.signature,
  });

  const data = await validatePurchase(req.body.JSONdata, req.body.signature, req.user.steamId, jdata);
  if (!data) {
    res.json({
      status: 'error',
      message: 'purchase not valid',
    });
    return;
  }

  const coinCountString = data.productId.replace('mezmeraiz.skinswipe.coins_', '').replace('_withsale7', '');
  let coinCount = parseInt(coinCountString, 10);

  // Black Friday Coins
  // let startDate = 1575018000000;
  // let endDate = 1575277200000;
  // if (Date.now() > startDate && Date.now() < endDate) {
  //   coinCount *= 2;
  // }
  // New Year Coins
  // startDate = 1577664000000;
  // endDate = 1579564799000;
  // if (Date.now() > startDate && Date.now() < endDate) {
  //   coinCount *= 2;
  // }
  // 23 Febrary - 9th March Coins
  // startDate = 1582329600000;
  // endDate = 1583712000000;
  // if (Date.now() > startDate && Date.now() < endDate) {
  // }
  // coinCount *= 4;
  const coinsMap = {
    75: 1000,
    455: 2000,
    2000: 4000,
    11000: 3999,
  };
  if (!coinsMap[coinCount]) {
    discord({ message: `[userPurchaseAndroid][${req.user.steamId}][${req.body.coinCount}] coins not mapped!` });
  } else {
    coinCount = coinsMap[coinCount];
  }

  const transaction = await Purchase.findOne({ token: data.purchaseToken }).lean();
  if (transaction) {
    logger.error(`Transction already exests: [${JSON.stringify(transaction)}]`);
    res.json({
      status: 'error',
      message: 'already have token',
    });
    return;
  }

  await UserController.changeTopPoints(req.user.steamId, config.topSettings.buyCoinMultiplier * coinCount, {
    action: 'buyCoins',
    steamId: req.user.steamId,
    partnerSteamId: null,
    amount: config.topSettings.buyCoinMultiplier * coinCount,
  });
  // await discord({ message: `[android] new coins purchase: ${req.user.personaname} [${req.user.steamId}] [+${coinCount}]` });
  await changeCoins(req.user, jdata.purchaseToken, coinCount);
  if (coinCount === COINS_AMOUNT_FOR_PREMIUM_BONUS) {
    await givePremium(req.user, 'kassa-premium', PREMIUM_BONUS, jdata.purchaseToken);
  }
  res.json({ status: 'success' });
};
