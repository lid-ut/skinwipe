// const MoneyTransactions = require('../../../models/MoneyTransaction');
const User = require('../../../models/User');
// const MarketTrade = require('../../../models/MarketTrade');
// const Trade = require('../../../models/Trade');
const sumMoneyTransactions = require('../../../helpers/sumMoneyTransactions');
// const sendLogs = require('../../discordlogs/send');
// const getInfo = require('../../market/tansaction/getInfo');

module.exports = async (token, status, reason) => {
  // eslint-disable-next-line no-undef
  const transactions = await Transactions.findAll({ where: { token: token.toString(), status: { [Op.ne]: status } } });

  // eslint-disable-next-line no-restricted-syntax
  for (const transaction of transactions) {
    // eslint-disable-next-line no-await-in-loop
    const user = await User.findOne({ steamId: transaction.steamId });
    transaction.status = status;
    transaction.reason = reason;
    // eslint-disable-next-line no-await-in-loop
    await transaction.save();
    // eslint-disable-next-line no-await-in-loop
    await sumMoneyTransactions(user);
  }
};
