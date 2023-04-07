const MarketItem = require('../../../../models/MarketItem');

module.exports = async steamId => {
  await MarketItem.deleteMany({
    steamid: steamId,
  });
};
