const MarketTrade = require('../../../models/MarketTrade');
const Trade = require('../../../models/Trade');

const getInfo = require('../../../modules/money/transaction/getInfo');

const getTradeAmount = async transaction => {
  try{ 
    const fee = await Transactions.findOne({
      where: {
        type: 'sell_market_p2p_fee',
        token: transaction.token,
      },
    });
    if (fee) {
      return Math.round(transaction.amount + fee.amount) / 100;
    }
    return Math.round(transaction.amount) / 100;
  }catch (e) {
    return Math.round(transaction.amount) / 100;
  }
};

module.exports = async (req, res) => {
  const offset = (req.params.page - 1) * 20;
  const transactionsDb = await Transactions.findAll({
    limit: 30,
    offset,
    where: {
      type: { [Op.notIn]: ['sell_market_p2p_fee', 'buy_supertrade_p2p_fee', 'buy_trade_p2p_direct_fee', 'buy_trade_p2p_fee'] },
      steamId: req.user.steamId,
    },
    order: [['createdAt', 'DESC']],
  });

  const tokens = transactionsDb.map(it => it.token).filter(it => it.length === 24);
  const marketTrades = await MarketTrade.find({ _id: { $in: tokens } });
  const trades = await Trade.find({ _id: { $in: tokens } });

  const transactions = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const tran of transactionsDb) {
    let trade = marketTrades.filter(it => it._id.toString() === tran.token)[0];
    if (!trade) {
      trade = trades.filter(it => it._id.toString() === tran.token)[0];
    }
    transactions.push({
      _id: tran.id,
      status: tran.status,
      steamId: tran.steamId,
      token: tran.token,
      info: getInfo(tran, trade),
      // eslint-disable-next-line no-await-in-loop
      amount: await getTradeAmount(tran),
      trade,
    });
  }

  res.json({ status: 'success', result: transactions });
};
