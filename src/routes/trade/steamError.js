const ObjectId = require('mongoose').Types.ObjectId;

const Auction = require('../../models/Auction');
const Trade = require('../../models/Trade');
const TradesController = require('../../controllers/TradesController');

module.exports = async (req, res) => {
  if (req.body.tradeId) {
    await Trade.findOne({ _id: req.body.tradeId });

    await TradesController.reject({
      user: req.user,
      steamId: req.user.steamId,
      steamError: req.body.steamError,
      tradeId: req.body.tradeId,
      steamTradeStatus: 'rejected',
      steamTradeInfo: 'steam',
    });
  }
  if (req.body.betId) {
    await Auction.updateOne(
      {
        'bets._id': ObjectId(req.body.betId),
      },
      {
        $set: {
          'bets.$.tradeObject.steamError': req.body.steamError,
        },
      },
    );
  }
  const result = req.body.steamError;
  res.json({ status: 'success', result });
};
