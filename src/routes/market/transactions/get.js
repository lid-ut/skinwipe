const MoneyTransactions = require('../../../models/MoneyTransaction');
const MarketTrade = require('../../../models/MarketTrade');
const Trade = require('../../../models/Trade');

const getInfo = require('../../../modules/money/transaction/getInfo');

const getTradeAmount = async transaction => {
  const fee = await Transactions.findOne({
    type: 'sell_market_p2p_fee',
    token: transaction.token,
  });
  if (fee) {
    return Math.round(transaction.amount + fee.amount) / 100;
  }
  return Math.round(transaction.amount) / 100;
};

module.exports = async (req, res) => {
  const transactionsDb = await Transactions.findOne({ where: { id: req.params.id } });

  let tradeMarket = null;
  let tradeP2p = null;

  if (transactionsDb.token.length === 24) {
    tradeMarket = await MarketTrade.findOne({ _id: transactionsDb.token }).lean();
    tradeP2p = await Trade.findOne({ _id: transactionsDb.token }).lean();
  }

  if (tradeMarket) {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of tradeMarket.items) {
      item.paintWear = parseFloat(item.float !== 'unavailable' ? item.float : 0) || 0;
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const item of tradeMarket.itemsPartner) {
      item.paintWear = parseFloat(item.float !== 'unavailable' ? item.float : 0) || 0;
    }
  }

  if (tradeP2p) {
    delete tradeP2p.money;
    tradeP2p.likes = tradeP2p.likes ? tradeP2p.likes.length : 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const item of tradeP2p.items) {
      item.paintWear = parseFloat(item.float !== 'unavailable' ? item.float : 0) || 0;
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const item of tradeP2p.itemsPartner) {
      item.paintWear = parseFloat(item.float !== 'unavailable' ? item.float : 0) || 0;
    }
  }

  const createdAt = tradeMarket || tradeP2p ? (tradeMarket || tradeP2p).createdAt : transactionsDb.createdAt;
  const updatedAt = tradeMarket || tradeP2p ? (tradeMarket || tradeP2p).updatedAt : transactionsDb.updatedAt;

  res.json({
    status: 'success',
    result: {
      _id: transactionsDb.id,
      status: transactionsDb.status,
      steamId: transactionsDb.steamId,
      token: transactionsDb.token,
      info: getInfo(transactionsDb, tradeMarket || tradeP2p),
      amount: await getTradeAmount(transactionsDb),
      createdAt,
      updatedAt,
      tradeMarket,
      tradeP2p,
    },
  });
};
