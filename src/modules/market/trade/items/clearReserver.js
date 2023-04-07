const MarketItem = require('../../../../models/MarketItem');

module.exports = async trade => {
  const assetids = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const item of trade.items) {
    assetids.push(item.assetid);
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const item of trade.itemsPartner) {
    assetids.push(item.assetid);
  }

  await MarketItem.updateMany(
    {
      assetid: { $in: assetids },
      steamid: trade.seller,
      reserver: trade.buyer,
    },
    { $set: { reserver: null } },
  );
};
