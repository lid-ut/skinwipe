const Auction = require('../../models/Auction');

module.exports = async function process(req) {
  const auction = await Auction.findOne({
    _id: req.params.auctionId,
    steamId: req.user.steamId,
    status: { $in: ['open', 'processed'] },
  });
  if (!auction) {
    return { status: 'error', code: 0, message: 'auction not found' };
  }
  auction.bets = auction.bets.map(ab => {
    if (ab.tradeObject) {
      ab.tradeObject.status = 'reject';
    }
    return ab;
  });
  if (!auction.notifications) {
    auction.notifications = {};
  }
  auction.notifications.closed = true;
  auction.status = 'close';
  auction.autoClose = false;
  await auction.save();
  return { status: 'success' };
};
