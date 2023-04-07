const User = require('../../../src/models/User');
const sumMoneyTransactions = require('../../../src/helpers/sumMoneyTransactions');

module.exports = async () => {
  return new Promise(resolve => {
    User.find({
      money: { $ne: 0 },
    })
      .cursor()
      .eachAsync(
        async user => {
          await sumMoneyTransactions(user);
        },
        { parallel: 50 },
      )
      .then(() => {
        resolve();
      });
  });
};
