const Auction = require('../../models/Auction');
const checkCoins = require('../../helpers/checkCoins');
const config = require('../../../config');

module.exports = async req => {
  const auctions = await Auction.countDocuments({ steamId: req.user.steamId, status: 'open' });

  let coinsNeeded = 10 * auctions;
  if (req.user.subscriber) {
    let blockPeriod = Date.now() - 5 * 60 * 1000;
    if (!config.production) {
      blockPeriod = Date.now() - 60 * 1000;
    }
    if (auctions && new Date(req.user.lastAuctionRise).getTime() < blockPeriod) {
      coinsNeeded = 10 * (auctions - 1);
    }
    return {
      status: 'success',
      result: {
        auctions,
        coinsNeeded,
        haveEnoughCoins: await checkCoins(req.user, coinsNeeded),
      },
    };
  }

  return {
    status: 'success',
    result: {
      auctions,
      coinsNeeded,
      haveEnoughCoins: await checkCoins(req.user, coinsNeeded),
    },
  };
};
