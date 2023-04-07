const Trade = require('../../models/Trade');
const MessageTrade = require('../../models/MessageTrade');
const Auction = require('../../models/Auction');
const TradesController = require('../../controllers/TradesController');
const UserController = require('../../controllers/UserController');

const getAuctionTradesList = async user => {
  const auctions = await Auction.find(
    {
      status: 'processed',
      'bets.steamId': user.steamId,
      'bets.tradeObject.steamTradeStatus': 'sent',
    },
    { steamId: 1, bets: { $elemMatch: { 'tradeObject.steamTradeStatus': 'sent' } } },
  )
    .populate('user bets.user')
    .exec();

  const trades = [];
  auctions.forEach(a => {
    a.bets.forEach(ab => {
      if (!ab.dates || !ab.dates.created) {
        ab.dates = {
          created: new Date(),
        };
      }
      trades.push({
        ...ab.tradeObject,
        itemsPartner: a.items,
        auctionId: a._id,
        user1: ab.user,
        user2: a.user,
        steamIdPartner: a.steamId,
        steamId: ab.steamId,
        datecreate: ab.dates.created,
      });
    });
  });

  return trades;
};

const getTrades = async user => {
  const trades = await Trade.find({
    status: 'accepted',
    steamTradeStatus: 'sent',
    steamId: user.steamId,
  })
    .populate('user1 user2')
    .sort({
      createdAt: -1,
    })
    .lean()
    .exec();

  const auctionTrades = await getAuctionTradesList(user);
  auctionTrades.forEach(at => {
    trades.push(at);
  });

  if (!trades) {
    return [];
  }

  const itemsWithAssetId = await UserController.getUserItemsForAutoTrade(user);
  return TradesController.processTradesList(trades, user, itemsWithAssetId);
};

module.exports = async function process(req, res) {
  const trades = await getTrades(req.user);
  res.json({ status: 'success', result: trades });
};
