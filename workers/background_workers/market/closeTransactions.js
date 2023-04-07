const close = require('../../../src/modules/market/trade/close');
const closeTransactions = require('../../../src/modules/market/tansaction/close');

module.exports = async callback => {
  await close();
  await closeTransactions();
  callback();
};
