const MarketItem = require('../models/MarketItem');

module.exports = async (steamId, limit, offset, tradable) => {
  const findObj = {
    reserver: steamId,
    virtual: true,
    withdrawn: { $ne: true },
  };

  if (tradable) {
    findObj.tradable = true;
  }

  const items = await MarketItem.find(findObj).limit(limit).skip(offset).lean();
  return items.map(it => {
    it.price.steam.mean *= 100;
    it.price.steam.safe *= 100;
    it.price.steam.converted *= 100;
    it.price.steam.base *= 100;
    return it;
  });
};
