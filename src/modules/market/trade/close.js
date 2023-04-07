const convertor = require('steam-id-convertor');

const User = require('../../../models/User');
const BotSteam = require('../../../models/BotSteam');
const MarketTrade = require('../../../models/MarketTrade');
const MarketItem = require('../../../models/MarketItem');
const getSteamTrades = require('../../steam/trades');

const changeTransaction = require('../../money/transaction/change');

const compareItems = (tradeSteam, items) => {
  if (
    (tradeSteam.items_to_receive && tradeSteam.items_to_receive.length !== items.length) ||
    (tradeSteam.items_to_give && tradeSteam.items_to_give.length !== items.length)
  ) {
    return false;
  }

  let found = false;
  if (tradeSteam.items_to_receive) {
    // eslint-disable-next-line no-restricted-syntax
    for (const itemSteam of tradeSteam.items_to_receive) {
      // eslint-disable-next-line no-restricted-syntax
      for (const item of items) {
        if (item.assetid === itemSteam.assetid) {
          found = true;
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
          found = true;
        }
      }
    }
  }

  return found;
};

const getTradeId = async (seller, buyer, trade) => {
  let tradesSteam = [];
  try {
    tradesSteam = await getSteamTrades(buyer.apiKey, 'get_sent_offers=1');
  } catch (e) {
    console.log(e);
  }

  let startTradeId = null;
  // eslint-disable-next-line no-restricted-syntax
  for (const tradeSteam of tradesSteam) {
    if (convertor.to64(tradeSteam.accountid_other) !== seller.steamId) {
      // eslint-disable-next-line no-continue
      continue;
    }
    if (compareItems(tradeSteam, trade.items.concat(trade.itemsPartner))) {
      startTradeId = tradeSteam.tradeofferid;
    }
  }

  if (startTradeId) {
    return startTradeId;
  }
  try {
    tradesSteam = await getSteamTrades(seller.apiKey, 'get_received_offers=1');
  } catch (e) {
    console.log(e);
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const tradeSteam of tradesSteam) {
    if (convertor.to64(tradeSteam.accountid_other) !== buyer.steamId) {
      // eslint-disable-next-line no-continue
      continue;
    }
    if (compareItems(tradeSteam, trade.items.concat(trade.itemsPartner))) {
      startTradeId = tradeSteam.tradeofferid;
    }
  }

  if (startTradeId) {
    return startTradeId;
  }

  return null;
};

module.exports = async () => {
  try {
    let waitTrades = await MarketTrade.find({
      status: 'wait',
      createdAt: { $lte: new Date(Date.now() - 15 * 1000) },
    });
    const trades = await MarketTrade.find({ status: 'check', steamTradeId: null });
    waitTrades = waitTrades.concat(trades);
    // eslint-disable-next-line no-undef,no-restricted-syntax
    for (const trade of waitTrades) {
      // eslint-disable-next-line no-await-in-loop
      let seller = await User.findOne({ steamId: trade.seller });

      if (!seller) {
        // eslint-disable-next-line no-await-in-loop
        seller = await BotSteam.findOne({ steamid: trade.seller });
        if (seller) seller.steamId = seller.steamid;
      }
      // eslint-disable-next-line no-await-in-loop
      const buyer = await User.findOne({ steamId: trade.buyer });

      // eslint-disable-next-line no-await-in-loop
      trade.steamTradeId = await getTradeId(seller, buyer, trade);

      if (trade.steamTradeId) {
        trade.status = 'check';
      } else if (trade.type === 'user' && trade.createdAt < new Date(Date.now() - 5 * 60 * 1000)) {
        trade.closeReason = `принимайте трейд ТОЛЬКО в Скинсвайп! Баланс за трейд, который принят не в приложении Скинсвайп, начислен НЕ будет. Этот трейд принимать в steam нельзя!`;
        trade.status = 'close';

        // eslint-disable-next-line no-await-in-loop
        await changeTransaction(trade._id, 'close');
      } else if (trade.type === 'bot' && trade.createdAt < new Date(Date.now() - 60 * 60 * 1000)) {
        if (trade.send) {
          // eslint-disable-next-line no-await-in-loop
          await MarketItem.updateMany(
            {
              assetid: { $in: trade.itemsPartner.map(it => it.assetid) },
              reserver: trade.buyer,
            },
            {
              $set: {
                withdrawn: false,
                virtual: true,
              },
            },
          );
          trade.closeReason = `Не удалось получить id трейда, попробуйте вывести скин через 5 минут`;
        } else {
          trade.closeReason = `Отмените трейд в стим, баланс не будет начислен`;
        }

        trade.status = 'close';
        // eslint-disable-next-line no-await-in-loop
        await changeTransaction(trade._id, 'close');
      }
      // eslint-disable-next-line no-await-in-loop
      await trade.save();
    }
  } catch (e) {
    console.log(e);
  }
};
