const MarketTrade = require('../../../models/MarketTrade');

module.exports = async (req, res) => {
  const offset = ((parseInt(req.body.page, 10) || 1) - 1) * 30;

  const trades = await MarketTrade.find({
    status: { $in: ['done', 'close'] },
    $or: [{ buyer: req.user.steamId }, { seller: req.user.steamId }],
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .skip(offset);

  // eslint-disable-next-line no-restricted-syntax
  // for (const trade of trades) {
  //   if (trade.type === 'bot') {
  //     if (trade.direction !== 'out') {
  //       const seller = trade.seller;
  //       trade.seller = trade.buyer;
  //       trade.buyer = seller;
  //     }
  //   }
  // }

  res.json({
    status: 'success',
    result: trades.map(it => {
      if (it.type === 'bot' && it.direction === 'in') {
        const buyer = `${it.seller}`;
        it.seller = it.buyer;
        it.buyer = buyer;
      }
      if (!it.code) {
        it.code = it._id;
      }
      if (it.status === 'check') {
        it.status = 'wait';
      }
      return it;
    }),
  });
};
