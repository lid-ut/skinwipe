const fetch = require('node-fetch');
const KassaInvoice = require('../../../models/KassaInvoice');
const getUSDRate = require('../../../helpers/getUSDRate');
const config = require('../../../../config');

module.exports = async function process(req) {
  let amount = parseInt(req.params.amount, 10) / 100;
  const usdrate = await getUSDRate();
  amount *= usdrate;

  let redirect;
  const orderDescription = `market payment ${amount}`;

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
          value: amount.toFixed(2),
          currency: 'RUB',
        },
        vat_code: '1',
        payment_mode: 'full_payment',
        payment_subject: 'payment',
        country_of_origin_code: 'RU',
      },
    ],
  };
  const data = {
    description: `SkinSwipe ${orderDescription}`,
    capture: true,
    amount: {
      value: amount.toFixed(2),
      currency: 'RUB',
    },
    // payment_method_data: {
    //   type: 'qiwi',
    // },
    // payment_method_data: {
    //   type: 'bank_card',
    // },
    // save_payment_method: 'true',
    confirmation: {
      type: 'redirect',
      return_url: 'https://skinswipe.ru/',
    },
    receipt,
  };

  if (req.headers['fee-key'] === config.tg.feeKey) {
    data.metadata = {
      tg: true,
    };
  }

  let YKresponse = await fetch(`https://${config.kassa.shopId}:${config.kassa.key}@api.yookassa.ru/v3/payments`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Idempotence-Key': idKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
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
  YKresponse.product = 'market';
  YKresponse.receipt = receipt;
  YKresponse.productCount = 1;
  if (req.params.platform) {
    YKresponse.platform = req.params.platform;
  }
  await new KassaInvoice(YKresponse).save();

  return {
    status: 'success',
    redirect,
  };
};
