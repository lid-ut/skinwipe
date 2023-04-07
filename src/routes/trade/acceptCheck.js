const ObjectId = require('mongoose').Types.ObjectId;
const Trade = require('../../models/Trade');
const User = require('../../models/User');
const MessageTrade = require('../../models/MessageTrade');
const Auction = require('../../models/Auction');

const accept = require('./accept');

const handleMoney = async trade => {
  const partner = await User.findOne({ steamId: trade.steamId });
  if (partner.money < trade.money) {
    return { status: 'error', code: 3, message: 'Partner have no money' };
  }
  return { status: 'success' };
};

const acceptCheckMessageTrade = async (params, tradeMessage) => {
  if (tradeMessage.money) {
    return handleMoney(tradeMessage);
  }
  return { status: 'success' };
};

const acceptCheckAuctionTrade = async () => {
  return { status: 'success' };
};

const acceptCheckTrade = async (params, trade) => {
  if (trade.money) {
    return handleMoney(trade);
  }
  return { status: 'success' };
};

module.exports = async function process(req) {
  try {
    console.log(req.body);

    req.body.steamTradeStatus = 'not found';
    const params = {
      user: req.user,
      steamId: req.user.steamId,
      tradeId: req.body.tradeId,
      steamTradeStatus: req.body.steamTradeStatus,
      steamTradeID: req.body.steamTradeID || '',
      appVersion: req.appVersion,
    };

    const trade = await Trade.findOne({
      _id: params.tradeId,
      status: { $nin: ['reject', 'close', 'done', 'finished'] },
    });
    let result = { status: 'error' };

    if (!trade) {
      const tradeMessage = await MessageTrade.findOne({
        _id: params.tradeId,
        status: { $nin: ['reject', 'close', 'done', 'finished'] },
      });
      if (tradeMessage) {
        const tradeFound = await Trade.findOne({ code: tradeMessage.code, steamId: tradeMessage.steamId });

        if (tradeFound && tradeFound.status !== 'new' && tradeFound.steamTradeID) {
          return { status: 'error', code: 2, message: 'Already accepted' };
        }
        result = await acceptCheckMessageTrade(params, tradeMessage);
      }
      const auctionTrade = await Auction.findOne({
        'bets.tradeObject._id': ObjectId(params.tradeId),
        'bets.tradeObject.status': 'new',
      });
      if (auctionTrade) {
        result = await acceptCheckAuctionTrade(params, auctionTrade);
      }
    } else {
      if (trade.status !== 'new' && trade.steamTradeID) {
        return { status: 'error', code: 2, message: 'Already accepted' };
      }
      result = await acceptCheckTrade(params, trade);
    }
    if (result.status === 'error') {
      return result;
    }
    return accept(req);
  } catch (e) {
    console.log(e);
  }
};
