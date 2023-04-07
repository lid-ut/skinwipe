require('../../logger');

const KassaInvoice = require('../../src/models/KassaInvoice');

KassaInvoice.find({
  status: 'succeeded',
  product: { $in: ['market'] },
}).then(async datas => {
  let sum = 0;
  for (const data of datas) {
    sum += parseFloat(data.amount.value);
  }

  console.log(sum);
  console.log(datas.length);
});
