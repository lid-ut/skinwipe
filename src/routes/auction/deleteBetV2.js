const Auction = require('../../models/Auction');

module.exports = async function process(req) {
  const auction = await Auction.findOne({ _id: req.params.auctionId });
  if (!auction) {
    return { status: 'error', code: 1, message: 'auction not found' };
  }

  if (auction.status !== 'open') {
    return { status: 'error', code: 2, message: 'auction is closed' };
  }

  auction.bets = auction.bets.filter(bet => {
    if (!bet.tradeObject || !bet.tradeObject._id) {
      return false;
    }
    if (auction.steamId !== req.user.steamId && bet.steamId !== req.user.steamId) {
      return true;
    }
    return !(bet.tradeObject._id.toString() === req.params.betId);
  });
  await Auction.updateOne({ _id: auction._id }, { $set: { bets: auction.bets } });

  return { status: 'success' };
};
