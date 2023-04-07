const MarketTrade = require('../../../models/MarketTrade');
const UserSteamItems = require('../../../models/UserSteamItems');

module.exports = async (user, tradeId, info) => {
  const trade = await MarketTrade.findOne({ _id: tradeId });

  if (!trade) {
    console.log(`${tradeId} - is not defined ${info.steamTradeId}`);
    return;
  }

  if (trade.type === 'bot') {
    const inventories = await UserSteamItems.find({ steamId: user.steamId });
    // eslint-disable-next-line no-restricted-syntax
    for (const inv of inventories) {
      for (let i = 0; i < inv.steamItems.length; i++) {
        if (trade.items.map(it => it.assetid).indexOf(inv.steamItems[i].assetid) !== -1) {
          inv.steamItems[i] = null;
        }
      }
      inv.steamItems = inv.steamItems.filter(it => !!it);
      // eslint-disable-next-line no-await-in-loop
      await inv.save();
    }
  }

  if (info.steamTradeId) {
    if (trade.status === 'close ') {
      return;
    }
    trade.status = 'check';
    trade.steamTradeId = info.steamTradeId;
  }
  await trade.save();
};
