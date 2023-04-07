require('../logger');
const User = require('../src/models/User');
const Auction = require('../src/models/Auction');

(async () => {
  const now = Date.now();
  console.log('AUCTIONS LOAD START');
  const auctions = await Auction.find({}).sort({ dateCreate: -1 }).populate('user bets.user').limit(1000).skip(1500).exec();

  const time = Date.now() - now;
  console.log(`AUCTIONS LOAD END ${time / 1000}s / ${time}ms `);
})();
