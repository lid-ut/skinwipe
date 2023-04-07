require('../logger');
const Transactions = require('../src/models/Transaction');

Transactions.aggregate([
  { $match: { token: 'faq' } },
  {
    $group: {
      _id: '$user_steam_id',
      count: { $sum: 1 },
    },
  },
  { $match: { _id: { $ne: null }, count: { $gt: 1 } } },
  { $sort: { count: -1 } },
]).then(async transactions => {
  console.log('Suspicious SIDs:', transactions.length);
  logger.info('Done!');
  process.exit(1);
});
