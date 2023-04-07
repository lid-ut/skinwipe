require('../../logger');
const User = require('../../src/models/User');
const sumMoneyTransactions = require('../../src/helpers/sumMoneyTransactions');
const initSequelize = require('../../src/modules/sequelize/init');

initSequelize(async () => {
  const user = await User.findOne({
    steamId: '76561198825476239',
  });

  console.log(user);
  await sumMoneyTransactions(user);
});
