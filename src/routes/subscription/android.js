const User = require('../../models/User');
const Purchase = require('../../models/Purchase');
const MoneyTransactions = require('../../models/MoneyTransaction');
const changeMoney = require('../../helpers/changeMoney');
const sumMoneyTransactions = require('../../helpers/sumMoneyTransactions');
const checkSubInfo = require('../../helpers/checkSubInfo');
const changeCoins = require('../../helpers/changeCoins');

const COINS_AMOUNT_FOR_PREMIUM_BONUS = 3999;
const PREMIUM_BONUS = 1;
const PREMIUM_MONTH_FOR_COINS_BONUS = 6;
const COINS_BONUS = 1000;

const savePurchase = async data => {
  const oldPurchase = await Purchase.findOne({ steamId: data.steamId, token: data.token });
  if (oldPurchase) return;
  await new Purchase({ success: false, iapErrors: [], ...data }).save();
};

const getSamePurchasesCount = async (steamId, token) => {
  const sameUserPurchase = await Purchase.findOne({ steamId, token });
  if (sameUserPurchase) {
    return { sameUser: true, count: 1 };
  }
  const count = await Purchase.countDocuments({ token });
  return { sameUser: false, count };
};

module.exports = async function process(req) {
  try {
    JSON.parse(req.body.JSONdata);
  } catch (e) {
    logger.error(`[userSubAndroid] JSONdata parsing filed: ${e}`);
    return { status: 'error', code: 0, message: 'JSONdata is invalid' };
  }

  if (!req.user.subInfo) req.user.subInfo = [];

  const sameTokens = await getSamePurchasesCount(req.user.steamId, req.body.purchaseToken);
  if (sameTokens.count && !sameTokens.sameUser) {
    logger.error(`[subStartAndroid] getSamePurchasesCount: sameTokenCount [${req.user.steamId}]`);
    return { status: 'error', code: 2, message: 'same token found' };
  }

  const currentSubIndex = req.user.subInfo.findIndex(si => si.token === req.body.purchaseToken);
  if (currentSubIndex > -1) {
    req.user.subInfo[currentSubIndex].JSONdata = req.body.JSONdata;
    req.user.subInfo[currentSubIndex].signature = req.body.signature;
  } else {
    req.user.subInfo.push({
      createdAt: new Date(),
      subType: 'first',
      store: 'android',
      token: req.body.purchaseToken,
      screen: req.body.screen || 'screen',
      JSONdata: req.body.JSONdata,
      signature: req.body.signature,
    });
  }
  await User.updateOne({ _id: req.user._id }, { $set: { subInfo: req.user.subInfo } });

  if (!sameTokens.count) {
    await savePurchase({
      steamId: req.user.steamId,
      token: req.body.purchaseToken,
      JSONdata: req.body.JSONdata,
      signature: req.body.signature,
      data: {
        createdAt: new Date(),
        subType: 'first',
        store: 'android',
        token: req.body.purchaseToken,
        screen: req.body.screen || 'screen',
      },
    });
  }

  const result = await checkSubInfo(req.user);

  const newSubIndex = req.user.subInfo.findIndex(si => si.token === req.body.purchaseToken);
  if (currentSubIndex === -1 && newSubIndex > -1) {
    const regExpForBonus = new RegExp(`premium${PREMIUM_MONTH_FOR_COINS_BONUS}m$`);
    if (req.user.subInfo[newSubIndex] && req.user.subInfo[newSubIndex].productId.match(regExpForBonus)) {
      await changeCoins(req.user, req.body.purchaseToken, COINS_BONUS);
    }
  }

  if (!result) {
    return { status: 'error', code: 1, message: 'fail' };
  }

  if (req.body.screen === 'trial' && req.body.sku === 'com.mezmeraiz.skinswipe.premium12m') {
    const transaction = await MoneyTransactions.findOne({ steamId: req.user.steamId, token: '1_dollar_for_prem' });
    if (!transaction) {
      await changeMoney(req.user, '1_dollar_for_prem', 'in', 'done', '', 100);

      // await changeMoney(req.user, 'done', '1_dollar_for_prem', 100);
      await sumMoneyTransactions(req.user);
    }
  }

  return { status: 'success' };
};
