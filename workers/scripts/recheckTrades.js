require('../../logger');

const check = require('../background_workers/market/checkTrades');

(async () => {
  await check(() => {
    console.log('done');
  });
})();
