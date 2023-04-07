const Auction = require('../../models/Auction');
const User = require('../../models/User');
const checkCoins = require('../../helpers/checkCoins');
const addPaidStat = require('../../helpers/addPaidStat');
const changeCoins = require('../../helpers/changeCoins');
const config = require('../../../config');

module.exports = async req => {
  const auctions = await Auction.find({ steamId: req.user.steamId, status: 'open' }, { _id: 1 }).lean();
  if (!auctions.length) {
    return {
      status: 'error',
      code: 1,
      message: 'no auctions',
    };
  }

  let coinsNeeded = 10 * auctions.length;
  let haveEnoughCoins = await checkCoins(req.user, coinsNeeded);

  if (req.user.subscriber) {
    let blockPeriod = Date.now() - 5 * 60 * 1000;
    if (!config.production) {
      blockPeriod = Date.now() - 60 * 1000;
    }
    if (auctions.length && new Date(req.user.lastAuctionRise).getTime() < blockPeriod) {
      coinsNeeded = 10 * (auctions.length - 1);
    }
    haveEnoughCoins = await checkCoins(req.user, coinsNeeded);

    if (!haveEnoughCoins) {
      return {
        status: 'error',
        code: 2,
        message: 'not enough money',
      };
    }

    if (new Date(req.user.lastAuctionRise).getTime() < blockPeriod) {
      await addPaidStat('upAuctionFree');
    }
    if (coinsNeeded > 0) {
      await addPaidStat('upAuction', coinsNeeded);
      await changeCoins(req.user, 'upAuction', coinsNeeded * -1);
    }
    await User.updateOne({ _id: req.user._id }, { $set: { lastAuctionRise: Date.now() } });
  } else {
    if (!haveEnoughCoins) {
      return {
        status: 'error',
        code: 2,
        message: 'not enough money',
      };
    }
    await addPaidStat('upAuction', coinsNeeded);
    await changeCoins(req.user, 'upAuction', coinsNeeded * -1);
  }

  for (let i = 0; i < auctions.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await Auction.updateOne({ _id: auctions[i]._id }, { $set: { dateCreate: Date.now() } });
  }

  return {
    status: 'success',
    result: {
      auctions: auctions.length,
      coinsUsed: coinsNeeded,
    },
  };
};
