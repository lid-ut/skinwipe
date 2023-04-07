require('../../../logger');
const checkP2P = require('../../../src/modules/market/trade/checkP2P');
const initSequelize = require('../../../src/modules/sequelize/init');

initSequelize(async () => {
  await checkP2P();
});
