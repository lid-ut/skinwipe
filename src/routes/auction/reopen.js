const Auction = require('../../models/Auction');

module.exports = async function process(req) {
  const auction = await Auction.findOne({
    _id: req.params.auctionId,
    steamId: req.user.steamId,
    status: 'processed',
  });
  if (!auction) {
    return { status: 'error', code: 1 };
  }

  if (!auction.bets) {
    auction.bets = [];
  }
  for (let i = 0; i < auction.bets.length; i++) {
    if (!auction.bets[i].tradeObject) {
      auction.bets[i].tradeObject = {};
    }
    auction.bets[i].tradeObject.status = 'new';
    auction.bets[i].tradeObject.notifications = { created: true };
  }
  auction.status = 'open';
  await Auction.updateOne({ _id: auction._id }, { $set: auction });
  return { status: 'success' };
};
