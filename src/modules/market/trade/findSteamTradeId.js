const convertor = require('steam-id-convertor');

const User = require('../../../models/User');
const getSteamTrades = require('../../steam/trades');

const Trade = require('../../../models/Trade');

const compareItems = (tradeSteam, items) => {
  let foundCount = 0;
  if (tradeSteam.items_to_receive) {
    // eslint-disable-next-line no-restricted-syntax
    for (const itemSteam of tradeSteam.items_to_receive) {
      // eslint-disable-next-line no-restricted-syntax
      for (const item of items) {
        if (item.assetid === itemSteam.assetid) {
          foundCount++;
        }
      }
    }
  }

  if (tradeSteam.items_to_give) {
    // eslint-disable-next-line no-restricted-syntax
    for (const itemSteam of tradeSteam.items_to_give) {
      // eslint-disable-next-line no-restricted-syntax
      for (const item of items) {
        if (item.assetid === itemSteam.assetid) {
          foundCount++;
        }
      }
    }
  }
  return foundCount === items.length;
};

const notHaveTrade = async steamTradeID => {
  const count = await Trade.countDocuments({ steamTradeID });
  // console.log(count);
  return count === 0;
};

const getTradeId = async (seller, buyer, trade) => {
  let tradesSteam = [];
  try {
    tradesSteam = await getSteamTrades(buyer.apiKey, 'get_received_offers=1&get_sent_offers=1');
  } catch (e) {
    console.log(e);
  }

  let startTradeId = null;
  // eslint-disable-next-line no-restricted-syntax
  for (const tradeSteam of tradesSteam) {
    if (seller) {
      if (convertor.to64(tradeSteam.accountid_other) !== seller.steamId) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (tradeSteam.message === `SkinSwipe #${trade.code}` || tradeSteam.message === '') {
        if (compareItems(tradeSteam, trade.items.concat(trade.itemsPartner))) {
          // eslint-disable-next-line no-await-in-loop
          const nhave = await notHaveTrade(tradeSteam.tradeofferid);
          if (nhave) {
            startTradeId = tradeSteam.tradeofferid;
            break;
          }
        }
      }
    }
  }
  if (startTradeId) {
    return startTradeId;
  }
  try {
    if (seller) {
      tradesSteam = await getSteamTrades(seller.apiKey, 'get_sent_offers=1&get_received_offers=1');
    }
  } catch (e) {
    console.log(e);
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const tradeSteam of tradesSteam) {
    if (buyer) {
      if (convertor.to64(tradeSteam.accountid_other) !== buyer.steamId) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (tradeSteam.message === `SkinSwipe #${trade.code}` || tradeSteam.message === '') {
        if (compareItems(tradeSteam, trade.items.concat(trade.itemsPartner))) {
          // eslint-disable-next-line no-await-in-loop
          const nhave = await notHaveTrade(tradeSteam.tradeofferid);
          if (nhave) {
            startTradeId = tradeSteam.tradeofferid;
            break;
          }
        }
      }
    }
  }

  return startTradeId;
};

module.exports = async () => {
  const trades = await Trade.find({
    // _id: "62e2ab055b373adb434edeac",
    status: 'accepted',
    createdAt: { $gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  });
  console.log(trades.length);
  // eslint-disable-next-line no-undef,no-restricted-syntax
  for (const trade of trades) {
    if (!(trade.steamTradeStatus === 'not found' || trade.steamTradeID === '' || trade.steamTradeID === null)) {
      // eslint-disable-next-line no-continue
      continue;
    }
    // eslint-disable-next-line no-await-in-loop
    const seller = await User.findOne({ steamId: trade.steamIdPartner });
    // eslint-disable-next-line no-await-in-loop
    const buyer = await User.findOne({ steamId: trade.steamId });

    try {
      // eslint-disable-next-line no-await-in-loop
      trade.steamTradeID = await getTradeId(seller, buyer, trade);

      if (trade.steamTradeID) {
        trade.steamTradeStatus = 'sent';
        // trade.attempts++;
        // eslint-disable-next-line no-await-in-loop
        await Trade.updateOne(
          { _id: trade._id },
          {
            $set: {
              steamTradeStatus: trade.steamTradeStatus,
              steamTradeID: trade.steamTradeID,
            },
          },
        );
      }
    } catch (e) {
      console.log(e);
    }
  }
};
