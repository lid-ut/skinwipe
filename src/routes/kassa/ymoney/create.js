const fetch = require('node-fetch');
const KassaInvoice = require('../../../models/KassaInvoice');
const AppStrings = require('../../../models/AppStrings');
const config = require('../../../../config');

const coinsMap = {
  600: 139,
  1200: 249,
  2400: 459,
  4800: 459,
};

const premiumMap = {
  1: 139,
  3: 299,
  6: 399,
  12: 649,
};

const premiumAfterTradeBan = {
  1: 69,
  3: 149,
  6: 199,
  12: 299,
};

const premiumForInactiveUsers = {
  1: 69,
  3: 149,
  6: 249,
  12: 359,
};

module.exports = async function process(req) {
  const translations = await AppStrings.findOne({
    platform: 'WEB',
    screenId: 'PREMIUM_ALL',
    locale: 'ru',
  });

  req.params.count = parseInt(req.params.count, 10);

  if (!req.params.product || ['coins', 'premium'].indexOf(req.params.product) === -1) {
    logger.error(`[kassa][create] invalid product: ${req.params.product}`);
    return {
      status: 'error',
    };
  }
  if (!req.params.count || req.params.count < 0) {
    logger.error(`[kassa][create] invalid count: ${req.params.count}`);
    return {
      status: 'error',
    };
  }
  if (req.params.product === 'coins' && !coinsMap[req.params.count]) {
    logger.error(`[kassa][create] invalid coins: ${req.params.count}`);
    return {
      status: 'error',
    };
  }
  if (req.params.product === 'premium' && !premiumMap[req.params.count]) {
    logger.error(`[kassa][create] invalid premium: ${req.params.count}`);
    return {
      status: 'error',
    };
  }
  let redirect;

  translations.yandexKassa = translations.yandexKassa || [];
  const yandexKassaPremiumPrices = translations.yandexKassa.reduce((result, item) => {
    result[parseInt(item.months)] = parseInt(item.price);
    return result;
  }, {});
  const yandexKassaPremiumTitles = translations.yandexKassa.reduce((result, item) => {
    result[parseInt(item.months)] = item.title;
    return result;
  }, {});
  const premiumPrice =
    yandexKassaPremiumPrices instanceof Object && Object.keys(yandexKassaPremiumPrices).length ? yandexKassaPremiumPrices : premiumMap;
  let price = req.params.product === 'coins' ? coinsMap[req.params.count] : premiumPrice[req.params.count];

  if (Boolean(req.query.includeSpecialOffers) && req.user.gotPremiumAfterTradeBan) {
    const subscription = req.user.subInfo.find(function (item) {
      return item.code === 'firstPremiumAfterTradeBan';
    });
    if (subscription && subscription.expirationTime >= new Date().getTime()) {
      price = premiumAfterTradeBan[req.params.count];
    }
    if (req.user.gotPremiumDiscountAfterInactive && req.user.gotPremiumDiscountDateStart > new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) {
      price = premiumForInactiveUsers[req.params.count];
    }
  }

  // eslint-disable-next-line default-case
  switch (req.params.count) {
    case 600:
      req.params.count = 1000;
      break;
    case 1200:
      req.params.count = 2000;
      break;
    case 2400:
      req.params.count = 3999;
      break;
    case 4800:
      req.params.count = 4000;
      break;
  }

  const orderDescription =
    req.params.product === 'coins'
      ? `Coins (${req.params.count})`
      : yandexKassaPremiumTitles[req.params.count] || `Premium (${req.params.count} m.)`;
  const idKey = `payment-${req.user.steamId}-${Date.now()}`;
  const receipt = {
    type: 'payment',
    send: 'true',
    customer: {
      full_name: req.user.personaname,
      email: req.user.email || `${req.user.steamId}@skinswipe.gg`,
    },
    items: [
      {
        description: `SkinSwipe ${orderDescription}`,
        quantity: 1.0,
        amount: {
          value: `${price}.00`,
          currency: 'RUB',
        },
        vat_code: '1',
        payment_mode: 'full_payment',
        payment_subject: 'payment',
        country_of_origin_code: 'RU',
      },
    ],
  };
  let YKresponse = await fetch(`https://${config.kassa.shopId}:${config.kassa.key}@api.yookassa.ru/v3/payments`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Idempotence-Key': idKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: `SkinSwipe ${orderDescription}`,
      capture: true,
      amount: {
        value: `${price}.00`,
        currency: 'RUB',
      },
      // payment_method_data: {
      //   type: 'qiwi',
      // },
      // payment_method_data: {
      //   type: 'bank_card',
      // },
      // save_payment_method: 'true', // todo
      confirmation: {
        type: 'redirect',
        return_url: 'https://web.skinswipe.gg/',
      },
      receipt,
    }),
  });

  if (!YKresponse || YKresponse.status !== 200) {
    logger.error(`[kassa][create] status: ${YKresponse.status}`);
    const message = await YKresponse.text();
    logger.error(`[kassa][create] status: ${message}`);
    return {
      status: 'error',
      code: YKresponse.status,
      // message: message.replace(/[\n"\t]/g, '')
    };
  }

  const text = await YKresponse.text();
  if (text.indexOf('{') !== 0) {
    logger.error(`[kassa][create] result text: ${text}`);
    return {
      status: 'error',
    };
  }
  YKresponse = JSON.parse(text);

  if (YKresponse.confirmation && YKresponse.confirmation.confirmation_url) {
    redirect = YKresponse.confirmation.confirmation_url;
  }

  YKresponse.steamId = req.user.steamId;
  YKresponse.product = req.params.product;
  YKresponse.receipt = receipt;
  YKresponse.productCount = req.params.count;
  await new KassaInvoice(YKresponse).save();

  return {
    status: 'success',
    redirect,
  };
};
