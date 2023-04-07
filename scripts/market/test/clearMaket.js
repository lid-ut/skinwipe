require('../../../logger');
const initSequelize = require('../../../src/modules/sequelize/init');

const clear = require('../../../src/modules/market/items/clear');

initSequelize(async () => {
  await clear();
  console.log('done');
});
