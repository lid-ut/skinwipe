const fetch = require('node-fetch');
const KassaInvoiceIOS = require('../../models/KassaInvoiceIOS');
const config = require('../../../config');

module.exports = async function process(req) {
  let redirect;
  const orderDescription = `Premium (${req.body.months} m.)`;
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
          value: req.body.amount,
          currency: 'RUB',
        },
        vat_code: '1',
        payment_mode: 'full_payment',
        payment_subject: 'payment',
        country_of_origin_code: 'RU',
      },
    ],
  };
  let YKresponse = await fetch(`https://${config.IOSKassa.shopId}:${config.IOSKassa.key}@api.yookassa.ru/v3/payments`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Idempotence-Key': idKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      payment_token: req.body.token,
      description: `SkinSwipe ${orderDescription}`,
      capture: false,
      amount: {
        value: req.body.amount,
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        enforce: false,
        return_url: 'https://www.merchant-website.com/return_url',
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
    };
  }

  const text = await YKresponse.text();
  if (text.indexOf('{') !== 0) {
    logger.error(`[kassa][create] result text: ${text}`);
    return { status: 'error' };
  }
  YKresponse = JSON.parse(text);

  if (YKresponse.confirmation && YKresponse.confirmation.confirmation_url) {
    redirect = YKresponse.confirmation.confirmation_url;
  }

  YKresponse.steamId = req.user.steamId;
  YKresponse.product = 'premium';
  YKresponse.receipt = receipt;
  YKresponse.productCount = req.params.months;
  await new KassaInvoiceIOS(YKresponse).save();

  return { status: 'success', redirect };
};
