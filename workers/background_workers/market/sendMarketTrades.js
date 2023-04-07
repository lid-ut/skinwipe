const Bot = require('../../../src/models/BotSteam');
const Trade = require('../../../src/models/BotSteamTrade');

const sendSteam = require('../../modules/trade/helpers/sendSteam');
const acceptSteam = require('../../../src/modules/trade/helpers/acceptSteam');
const closeTrades = require('../modules/trade/helpers/close');
const changeStatus = require('../modules/trade/helpers/changeStatus');

module.exports = async () => {
  const virtualTrades = await Trade.find({ type: 'virtual', status: 'new' });

  // eslint-disable-next-line no-restricted-syntax
  for (const trade of virtualTrades) {
    // eslint-disable-next-line no-await-in-loop
    await changeStatus(trade, 3);
  }

  const dateDiv15Sec = new Date(Date.now() - 15 * 1000);
  const bots = await Bot.find({ lastTradeSend: { $lte: dateDiv15Sec } });

  // eslint-disable-next-line no-restricted-syntax
  for (const bot of bots) {
    // eslint-disable-next-line no-await-in-loop
    const trade = await Trade.findOne({ bot, status: 'new' });
    if (trade) {
      if (trade.type === 'send') {
        console.log(`[send trade] for ${bot.steamid}`);
        // eslint-disable-next-line no-await-in-loop
        const result = await sendSteam(bot, trade);
        // eslint-disable-next-line no-await-in-loop
        await Bot.updateOne({ _id: bot._id }, { $set: { lastTradeSend: new Date() } });

        if (result.success) {
          trade.status = 'sent';
          trade.steamTradeId = result.offerid;
          // eslint-disable-next-line no-await-in-loop
          await trade.save();
        } else {
          if (result.err === 'try again') {
            if (!trade.attempt) {
              trade.attempt = 1;
            } else {
              trade.attempt++;
            }
            // eslint-disable-next-line no-await-in-loop
            await trade.save();
            if (trade.attempt < 2) {
              // eslint-disable-next-line no-continue
              continue;
            }
          }
          trade.status = 'close';
          trade.errorReason = JSON.stringify(result.err);
          // eslint-disable-next-line no-await-in-loop
          await trade.save();
          // eslint-disable-next-line no-await-in-loop
          await closeTrades(trade);
        }
      } else if (trade.type === 'accepted') {
        console.log(`[accept trade] ${trade.steamTradeId} for ${bot.steamid}`);
        // eslint-disable-next-line no-await-in-loop
        const result = await acceptSteam(bot, trade);
        if (result.success) {
          // eslint-disable-next-line no-await-in-loop
          trade.status = 'done';
          // eslint-disable-next-line no-await-in-loop
          await trade.save();
        } else {
          trade.status = 'close';
          // eslint-disable-next-line no-await-in-loop
          await trade.save();
        }
      }
    }
  }
};
