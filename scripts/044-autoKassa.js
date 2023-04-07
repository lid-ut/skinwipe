require('../logger');
const fetch = require('node-fetch');
const KassaInvoice = require('../src/models/KassaInvoice');
const config = require('../config');

const usersList = [
  '76561198054035851', // rtf6x
  // '76561198241316898', // vMamr
];
KassaInvoice.findOne({
  steamId: { $in: usersList },
  receipt: { $ne: null },
  product: 'premium',
  status: 'succeeded',
  'payment_method.id': { $ne: null },
}).then(async invoice => {
  if (!invoice) {
    logger.info('No invoices!');
    process.exit(1);
    return;
  }
  invoice.description += ' (subscription)';
  const idKey = `autopayment-${invoice.steamId}-${Date.now()}`;
  let YKresponse = await fetch(`https://${config.kassa.shopId}:${config.kassa.key}@api.yookassa.ru/v3/payments`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Idempotence-Key': idKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      capture: true,
      description: invoice.description,
      payment_method_id: invoice.payment_method.id,
      amount: invoice.amount,
      receipt: invoice.receipt,
    }),
  });

  if (!YKresponse || YKresponse.status !== 200) {
    logger.error(`[kassa][autopayment] status: ${YKresponse.status}`);
    const message = await YKresponse.text();
    logger.error(`[kassa][autopayment] status: ${message}`);
    return;
  }

  const text = await YKresponse.text();
  if (text.indexOf('{') !== 0) {
    logger.error(`[kassa][autopayment] result text: ${text}`);
    return;
  }
  YKresponse = JSON.parse(text);

  YKresponse.steamId = invoice.steamId;
  YKresponse.product = invoice.product;
  YKresponse.receipt = invoice.receipt;
  YKresponse.productCount = invoice.productCount;
  await new KassaInvoice(YKresponse).save();

  logger.info('Done!');
  process.exit(1);
});
