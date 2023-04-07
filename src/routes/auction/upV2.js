const Auction = require('../../models/Auction');
const User = require('../../models/User');
const checkCoins = require('../../helpers/checkCoins');
const addPaidStat = require('../../helpers/addPaidStat');
const changeCoins = require('../../helpers/changeCoins');
const config = require('../../../config');

module.exports = async req => {
  const auction = await Auction.findOne({ _id: req.params.auctionId });
  if (!auction) {
    return {
      status: 'error',
      code: 1,
      message: 'auction not found',
    };
  }

  if (!req.user.subscriber && !(await checkCoins(req.user, 10))) {
    return {
      status: 'error',
      code: 2,
      message: 'not enough money',
    };
  }

  if (req.user.subscriber) {
    let blockPeriod = Date.now() - 5 * 60 * 1000;
    if (!config.production) {
      blockPeriod = Date.now() - 60 * 1000;
    }
    if (new Date(req.user.lastAuctionRise).getTime() > blockPeriod) {
      return {
        status: 'error',
        code: 3,
        message: 'rate limit',
      };
    }
  }

  if (!req.user.subscriber) {
    await addPaidStat('upAuction', 10);
    await changeCoins(req.user, 'upAuction', -10);
  } else {
    await addPaidStat('upAuctionFree');
    await User.updateOne({ _id: req.user._id }, { $set: { lastAuctionRise: Date.now() } });
  }

  await Auction.updateOne({ _id: auction._id }, { $set: { dateCreate: Date.now() } });

  return { status: 'success' };
};
