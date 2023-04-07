const MarketTrade = require('../../../models/MarketTrade');
const generateUnicCode = require('../../../helpers/generateUnicCode');
const MarketItem = require('../../../models/MarketItem');

module.exports = async (user, items) => {
  const trades = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    const marketTrade = new MarketTrade({
      code: `${generateUnicCode.get()}`,
      type: 'csgotm',
      direction: 'in',
      buyer: user.steamId,
      seller: 'csgotm',
      tradeUrl: user.tradeUrl,
      status: 'new',
      csgotmStatus: 'new',
      items: [],
      itemsPartner: [item],
    });

    // eslint-disable-next-line no-await-in-loop
    await marketTrade.save();
    trades.push(marketTrade);
    // eslint-disable-next-line no-await-in-loop
    await MarketItem.updateOne(
      { _id: item._id },
      {
        $set: {
          reserver: user.steamId,
        },
      },
    );
  }
  return trades;
};
