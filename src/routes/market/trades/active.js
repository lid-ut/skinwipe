const MarketTrade = require('../../../models/MarketTrade');

module.exports = async (req, res) => {
  let find = {
    status: { $in: ['wait', 'check'] },
    $or: [{ buyer: req.user.steamId }, { seller: req.user.steamId }],
  };

  if (req.body.type === 'sell') {
    find = {
      $or: [
        {
          type: 'user',
          $or: [{ createdAt: { $gte: new Date(Date.now() - 20 * 60 * 1000) } }, { status: { $in: ['wait', 'check', 'done'] } }],
          seller: req.user.steamId,
        },
        {
          type: 'bot',
          direction: 'in',
          buyer: req.user.steamId,
          $or: [{ createdAt: { $gte: new Date(Date.now() - 20 * 60 * 1000) } }, { status: { $in: ['wait', 'check', 'done'] } }],
        },
      ],
    };
  } else if (req.body.type === 'buy') {
    find = {
      $or: [
        {
          type: { $ne: 'bot' },
          $or: [{ createdAt: { $gte: new Date(Date.now() - 20 * 60 * 1000) } }, { status: { $in: ['wait', 'check', 'done'] } }],
          buyer: req.user.steamId,
        },
        {
          type: 'bot',
          direction: 'out',
          buyer: req.user.steamId,
          $or: [{ createdAt: { $gte: new Date(Date.now() - 20 * 60 * 1000) } }, { status: { $in: ['wait', 'check', 'done'] } }],
        },
      ],
    };
  }

  const trades = await MarketTrade.find(find).sort({ createdAt: -1 });

  // eslint-disable-next-line no-restricted-syntax
  for (const trade of trades) {
    if (trade.type === 'bot') {
      if (trade.direction !== 'out') {
        const seller = trade.seller;
        trade.seller = trade.buyer;
        trade.buyer = seller;
      }
    } else if (trade.type === 'csgotm') {
      trade.seller = trade.buyer;
    }
  }

  res.json({
    status: 'success',
    result: trades.map(it => {
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
