const Auction = require('../../models/Auction');
const checkCoins = require('../../helpers/checkCoins');
const addPaidStat = require('../../helpers/addPaidStat');
const changeCoins = require('../../helpers/changeCoins');

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

  if (!req.user.subscriber) {
    await addPaidStat('markAuctionPremium', 10);
    await changeCoins(req.user, 'markAuctionPremium', -10);
  } else {
    await addPaidStat('markAuctionPremiumFree');
  }

  auction.premium = true;
  await auction.save();

  return { status: 'success' };
};
