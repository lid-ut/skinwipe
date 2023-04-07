const fetch = require('node-fetch');
const User = require('../../../../models/User');
const BotSteam = require('../../../../models/BotSteam');
const MarketItem = require('../../../../models/MarketItem');
const MarketTrade = require('../../../../models/MarketTrade');
const getSteamTrade = require('../../../steam/trade');
const getTradeSteamStatus = require('../../../steam/status');
const changeMoney = require('../../../../helpers/changeMoney');
const changeTransaction = require('../../../money/transaction/change');
const resetInventory = require('../../../../helpers/resetInventory');
const returnVirtual = require('../items/returnVirtual');
const sumMoneyTransactions = require('../../../../helpers/sumMoneyTransactions');

const addBuyer = async trade => {
  // eslint-disable-next-line no-restricted-syntax
  for (const item of trade.itemsPartner) {
    // eslint-disable-next-line no-await-in-loop
    await MarketItem.updateMany({ assetid: item.assetid }, { $set: { buyer: trade.buyer } });
  }
};

const sendAccept = async (bot, trade) => {
  try {
    console.log(`${bot.server}/trade/accept ${trade.steamTradeId}`);
    let result = await fetch(`${bot.server}/trade/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offerid: trade.steamTradeId,
      }),
    });
    result = await result.json();
    console.log(`${bot.server}`);
    console.log(result);
    return result;
  } catch (e) {
    console.log(e.toString());
    return { success: false };
  }
};

const doneTrade = async _id => {
  const trade = await MarketTrade.findOne({ _id });
  trade.status = 'done';
  // eslint-disable-next-line no-await-in-loop
  await addBuyer(trade);

  // eslint-disable-next-line no-await-in-loop
  const partner = await User.findOne({ steamId: trade.buyer });

  let sum = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const item of trade.items) {
    sum += item.price.steam.mean;
  }

  if (trade.direction === 'in') {
    // eslint-disable-next-line no-await-in-loop
    await changeMoney(partner, 'sell_market_bot', 'in', 'done', trade._id, sum);
  } else {
    await changeTransaction(trade._id, 'done');
  }
  await sumMoneyTransactions(partner);
  // eslint-disable-next-line no-await-in-loop
  await resetInventory(trade.buyer);
  // eslint-disable-next-line no-await-in-loop
  await trade.save();
};

const closeTrade = async (_id, err) => {
  const trade = await MarketTrade.findOne({ _id });
  trade.status = 'close';
  trade.closeReason = err;
  await changeTransaction(trade._id, 'close');
  await returnVirtual(trade);
  await trade.save();
};

module.exports = async trade => {
  if (!trade.steamTradeId) {
    await closeTrade(trade, `no steam trade id`);
    return;
  }

  if (trade.type === 'bot') {
    const bot = await BotSteam.findOne({ steamid: trade.seller });

    if (bot.server) {
      const steamTrade = await getSteamTrade(bot.apiKey, trade.steamTradeId);

      if (!steamTrade) {
        if (trade.createdAt < new Date(Date.now() - 60 * 60 * 1000)) {
          await closeTrade(trade._id, `Вы не подтвердили отправку трейда в стим, в следующий раз будет временный бан`);
        }
        return;
      }
      const status = getTradeSteamStatus(steamTrade).status;
      if (status === 'done') {
        await doneTrade(trade._id);
        return;
      }
      if (status === 'close' || !bot.active) {
        await closeTrade(trade._id, `close in steam ${steamTrade.trade_offer_state}`);
        return;
      }
      if (status === 'check') {
        const result = await sendAccept(bot, trade);
        console.log(result);

        if (result.success) {
          return;
        }
        if (
          result.error === 'try again' ||
          result.error === 'NoMatch' ||
          result.error === 'ServiceUnavailable' ||
          result.error === 'Not Logged In' ||
          result.error === 'No API-Key set (yet)' ||
          result.error === 'tunneling socket could not be established, cause=socket hang up'
        ) {
          if (!trade.attempt) {
            trade.attempt = 1;
          } else {
            trade.attempt++;
          }
          await trade.save();
          if (trade.attempt >= 10) {
            await closeTrade(trade._id, `close in steam ${steamTrade.trade_offer_state}`);
          }
        }
      }
    }
  }
};
