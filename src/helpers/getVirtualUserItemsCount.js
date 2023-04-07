const MarketItem = require('../models/MarketItem');

module.exports = async (steamId, tradable) => {
  const findObj = {
    reserver: steamId,
    virtual: true,
  };
  if (tradable) {
    findObj.tradable = true;
  }

  return MarketItem.countDocuments(findObj);
};
