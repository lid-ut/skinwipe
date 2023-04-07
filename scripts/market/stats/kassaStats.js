require('../../../logger');

const Kassa = require('../../../src/models/KassaInvoice');

(async () => {
  const kassaInvs = await Kassa.find({ status: 'succeeded' });

  let amount = 0;
  for (const kassa of kassaInvs) {
    amount += parseFloat(kassa.amount.value);
  }

  console.log(amount);
})();
