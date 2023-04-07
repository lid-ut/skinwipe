require('../logger');
const UserSteamItems = require('../src/models/UserSteamItems');
const User = require('../src/models/User');

// prevent from second execution
// process.exit(1);

// User.find({ personaname: 'trapholov' }).then(async users => {
User.aggregate([
  {
    $group: {
      _id: '$ipAddress',
      count: { $sum: 1 },
      trades: { $addToSet: '$stats.createdTrades' },
      auctions: { $addToSet: '$stats.createdAuctions' },
    },
  },
  { $match: { _id: { $ne: null }, count: { $gt: 1 } } },
  { $sort: { count: -1 } },
]).then(async users => {
  console.log('Suspicious IP Addresses:', users.length);
  let count = 0;
  let noTrades = 0;
  let noAuctions = 0;
  for (let i = 0; i < users.length; i++) {
    count += users[i].count;
    for (let j = 0; j < users[i].trades.length; j++) {
      if (!users[i].trades[j] || users[i].trades[j] < 1) {
        noTrades += 1;
      }
    }
    for (let j = 0; j < users[i].auctions.length; j++) {
      if (!users[i].auctions[j] || users[i].auctions[j] < 1) {
        noAuctions += 1;
      }
    }
  }
  console.log('MultiAccs count:', count);
  console.log('MultiAccs count (noTrades):', noTrades);
  console.log('MultiAccs count (noAuctions):', noAuctions);
  logger.info('Done!');
  process.exit(1);
});
