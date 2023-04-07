const User = require('../../../models/User');
const Trade = require('../../../models/Trade');

const changeTransaction = require('../../money/transaction/change');
const resetInventory = require('../../../helpers/resetInventory');

const getSteamTrade = require('../../steam/trade');
const getStatus = require('../../steam/status');
// const declineTradeSteam = require('../../steam/decline');

const closeTrade = async (trade, closeReason) => {
  await Trade.updateOne({ _id: trade._id }, { $set: { closeReason, status: 'reject', steamTradeStatus: 'close' } });
};

module.exports = async () => {
  const trades = await Trade.find({
    money: { $gt: 0 },
    steamTradeID: { $ne: null },
    steamTradeStatus: { $in: ['sent', 'received'] },
    createdAt: { $gte: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000) },
  });

  // console.log(trades.length);
  // return;
  // eslint-disable-next-line no-restricted-syntax
  for (const trade of trades) {
    // eslint-disable-next-line no-await-in-loop
    const user = await User.findOne({ steamId: trade.steamId });
    // eslint-disable-next-line no-await-in-loop
    const seller = await User.findOne({ steamId: trade.steamIdPartner });

    let steamTrade = null;

    try {
      if (user && user.apiKey) {
        // eslint-disable-next-line no-await-in-loop
        steamTrade = await getSteamTrade(user.apiKey, trade.steamTradeID);
      }
      if (!steamTrade && seller && seller.apiKey) {
        // eslint-disable-next-line no-await-in-loop
        steamTrade = await getSteamTrade(seller.apiKey, trade.steamTradeID);
      }
    } catch (e) {
      if (!trade.attempt) {
        trade.attempt = 1;
      } else {
        trade.attempt++;
      }

      // eslint-disable-next-line no-await-in-loop
      await trade.save();
    }

    if (!steamTrade) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const res = getStatus(steamTrade, trade.seller, trade.buyer);

    if (res.status === 'check') {
      // eslint-disable-next-line no-continue
      continue;
    }

    if (res.status === 'close') {
      // eslint-disable-next-line no-await-in-loop
      await closeTrade(trade, res.reason);
      // eslint-disable-next-line no-await-in-loop
      await changeTransaction(trade._id, 'close');
    }

    if (res.status === 'done') {
      if (trade.status === 'close') {
        // eslint-disable-next-line no-continue
        continue;
      }
      trade.status = 'finished';
      trade.steamTradeStatus = 'done';
      // eslint-disable-next-line no-await-in-loop
      await changeTransaction(trade._id, 'done');
      // eslint-disable-next-line no-await-in-loop
      await resetInventory(trade.steamId);
      // eslint-disable-next-line no-await-in-loop
      await resetInventory(trade.steamIdPartner);
      // eslint-disable-next-line no-await-in-loop
      await trade.save();
    }
  }
};
