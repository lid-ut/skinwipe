const Trade = require('../../../src/models/Trade');
const getSteamIdsByItemName = require('../../../src/helpers/getSteamIdsByItemName');

module.exports = async () => {
  const autoTrades = await Trade.find({ autoTrade: true, status: 'new', close: false }).limit(50).lean();
  // eslint-disable-next-line no-restricted-syntax
  for (const trade of autoTrades) {
    if (trade.itemsPartner === null || trade.itemsPartner.length === 0) {
      // eslint-disable-next-line no-await-in-loop
      await Trade.deleteOne({ _id: trade._id });
    } else {
      // eslint-disable-next-line no-await-in-loop
      const partnersSteamIds = await getSteamIdsByItemName(trade.itemsPartner[0].name, trade.steamId);
      // eslint-disable-next-line no-await-in-loop
      await Trade.updateOne({ _id: trade._id }, { $set: { partnersSteamIds } });
    }
  }
};
