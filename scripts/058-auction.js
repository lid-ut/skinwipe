function log(msg) {
  console.log(msg);
}

global.logger = { log, info: log };
const givePremium = require('../src/helpers/givePremium');
const Auction = require('../src/models/Auction');

(async () => {
  const auctions = await Auction.find({ steamId: '76561198123225195' }).limit(1);

  for (let i = 0; i < auctions.length; i++) {
    console.log();
  }

  console.log('end');
})();
