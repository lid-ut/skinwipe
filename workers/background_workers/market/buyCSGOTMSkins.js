const fetch = require('node-fetch');

const urlParser = require('url');
const MarketTrade = require('../../../src/models/MarketTrade');
const BotSteam = require('../../../src/models/BotSteam');
const getUSDRate = require('../../../src/helpers/getUSDRate');
const changeTransaction = require('../../../src/modules/money/transaction/change');

const buyForCSGOTM = async (id, price, tradeUrl, cId) => {
  try {
    const date = new Date();

    const usdrate = await getUSDRate();

    price *= usdrate * 10;
    const bot = await BotSteam.findOne({ csgotmKey: { $ne: null }, csgotmBalance: { $gte: price / 1000 } }).sort({ csgotmBalance: -1 });
    if (!bot) return null;

    const tradeUrlObj = urlParser.parse(tradeUrl, true);
    const partner = tradeUrlObj.query.partner;
    const token = tradeUrlObj.query.token;
    const url = `https://market.csgo.com/api/v2/buy-for?key=${bot.csgotmKey}&id=${id}&price=${Math.round(
      price,
    )}&partner=${partner}&token=${token}&custom_id=${cId}`;

    let res = await fetch(url);
    res = await res.json();
    logger.info(`[buy-for][csgotm] finished ${(Date.now() - date) / 1000}S`);
    return {
      ...res,
      csgotmKey: bot.csgotmKey,
    };
  } catch (e) {
    console.log(e);
  }
  return {};
};

const getError = error => {
  if (error === 'No item was found at the specified price or lower.') {
    return 'Skin already reserved';
  }

  return 'items already reserved';
};

module.exports = async () => {
  const marketTrades = await MarketTrade.find({ type: 'csgotm', status: 'new', csgotmStatus: 'new' });

  // eslint-disable-next-line no-restricted-syntax
  for (const trade of marketTrades) {
    const item = trade.itemsPartner[0];
    // eslint-disable-next-line no-await-in-loop
    const res = await buyForCSGOTM(item.assetid, item.price.steam.baseCSGOTM, trade.tradeUrl, trade._id.toString());
    let update;
    console.log(res);
    if (res.success) {
      update = {
        csgotmStatus: 'wait',
        csgotmKey: res.csgotmKey,
      };
    } else {
      update = {
        status: 'close',
        closeReason: getError(res.error),
      };
      // eslint-disable-next-line no-await-in-loop
      await changeTransaction(trade._id, 'close', 'seller not send item');
    }

    // eslint-disable-next-line no-await-in-loop
    await MarketTrade.updateOne({ _id: trade._id }, { $set: update });
  }
};
