const User = require('../../models/User');
const BotSteam = require('../../models/BotSteam');
const MarketItem = require('../../models/MarketItem');
const createMarketTradesBot = require('../../modules/market/trade/bot');

module.exports = async (req, res) => {
  const items = await MarketItem.find({ reserver: req.user.steamId, assetid: { $in: req.body.items.map(it => it.assetid) } });
  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    let seller = await User.findOne({ steamId: item.steamid });
    if (item.type === 'bot') {
      // eslint-disable-next-line no-await-in-loop
      seller = await BotSteam.findOne({ steamid: item.steamid });
    }

    if (!seller || !seller.apiKey) {
      item.visible = false;
      // eslint-disable-next-line no-await-in-loop
      await item.save();
      res.json({
        status: 'error',
        code: 1,
        message: 'The seller not have api key',
      });
      return;
    }
  }

  const trades = await createMarketTradesBot(req.user, items, true);

  res.json({
    status: 'success',
    result: trades,
  });
};
