require('../logger');
const Auction = require('../src/models/Auction');

Auction.find({ 'items.price.steam.mean': { $ne: null, $type: 'double' } })
  .sort({ _id: 1 })
  .limit(500)
  .then(async auctions => {
    for (let i = 0; i < auctions.length; i++) {
      auctions[i].items = auctions[i].items.map(item => {
        if (item.price && item.price.steam && item.price.steam.mean) {
          item.price.steam.mean = Math.round(item.price.steam.safe);
        }
        return item;
      });
      await auctions[i].save();
    }

    logger.info('Done!');
    process.exit(1);
  });
