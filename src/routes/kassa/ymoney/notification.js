const KassaInvoice = require('../../../models/KassaInvoice');
const MoneyTransaction = require('../../../models/MoneyTransaction');
const User = require('../../../models/User');
const changeCoins = require('../../../helpers/changeCoins');
const givePremium = require('../../../helpers/givePremium');
const sendDevToDev = require('../../../helpers/sendDevToDev');
const getUSDRate = require('../../../helpers/getUSDRate');
const changeMoney = require('../../../helpers/changeMoney');
const sumMoneyTransactions = require('../../../helpers/sumMoneyTransactions');

// const YaKaIPs = [
//   '185.71.76.0/27',
//   '185.71.77.0/27',
//   '77.75.153.0/25',
//   '77.75.154.128/25',
//   '2a02:5180:0:1509::/64',
//   '2a02:5180:0:2655::/64',
//   '2a02:5180:0:1533::/64',
//   '2a02:5180:0:2669::/64',
// ];

const COINS_AMOUNT_FOR_PREMIUM_BONUS = 3999;
const PREMIUM_BONUS = 1;
const PREMIUM_MONTH_FOR_COINS_BONUS = 6;
const COINS_BONUS = 1000;

module.exports = async function process(req) {
  if (!req.body || !req.body.object || !req.body.object.id) {
    logger.error('[kassa][notification] no object!');
    return { status: 'error' };
  }

  const invoice = await KassaInvoice.findOne({ id: req.body.object.id });
  if (!invoice) {
    logger.error('[kassa][notification] no invoice!');
    return { status: 'error' };
  }

  const user = await User.findOne({ steamId: invoice.steamId });
  if (!user) {
    logger.error('[kassa][notification] no user!');
    return { status: 'error' };
  }

  invoice.event = req.body.event;
  invoice.status = req.body.object.status;
  invoice.paid = req.body.object.paid;
  invoice.metadata = req.body.object.metadata;
  invoice.payment_method = req.body.object.payment_method;
  invoice.cancellation_details = req.body.object.cancellation_details;
  await invoice.save();

  if (req.body.event === 'payment.succeeded') {
    if (invoice.product === 'coins') {
      await changeCoins(user, 'kassa-coins', invoice.productCount);
      if (invoice.productCount === COINS_AMOUNT_FOR_PREMIUM_BONUS) {
        await givePremium(user, 'kassa-premium', PREMIUM_BONUS, invoice.id);
      }

      sendDevToDev('coins_after_buy', invoice.steamId, {
        sku: invoice.productCount,
        price: invoice.amount.value,
      });
    } else if (invoice.product === 'premium') {
      await givePremium(user, 'kassa-premium', invoice.productCount, invoice.id);

      if (invoice.productCount === PREMIUM_MONTH_FOR_COINS_BONUS) {
        await changeCoins(user, 'kassa-coins', COINS_BONUS);
      }

      sendDevToDev('premium_after_buy', invoice.steamId, {
        sku: invoice.productCount,
        price: invoice.amount.value,
      });
    } else if (invoice.product === 'market') {
      let usdAmount = invoice.amount.value;
      if (invoice.amount.currency === 'RUB') {
        const rubAmount = invoice.amount.value;
        const usdrate = await getUSDRate();
        usdAmount = rubAmount / usdrate;
      }

      let totalAmount = Math.round(usdAmount * 100); // 25% bonus
      if (totalAmount >= 2500) {
        totalAmount *= 1.05;
        await givePremium(user, 'kassa-premium', PREMIUM_BONUS, invoice.id);
      }

      await changeMoney(user, 'ykassa_add', 'in', 'done', invoice.id, totalAmount);

      await sumMoneyTransactions(user);

      // sendDevToDev('premium_after_buy', invoice.steamId, {
      //   sku: invoice.productCount,
      //   price: invoice.amount.value,
      // });
    }
  }

  return { status: 'success' };
};
