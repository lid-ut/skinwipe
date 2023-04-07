const User = require('../../../models/User');
const MarketTrade = require('../../../models/MarketTrade');
const MarketItem = require('../../../models/MarketItem');

const changeTransaction = require('../../money/transaction/change');
const clearReserver = require('./items/clearReserver');
const deleteSeller = require('./items/deleteSeller');

const resetInventory = require('../../../helpers/resetInventory');

const getSteamTrade = require('../../steam/trade');
const getStatus = require('../../steam/status');
const declineTradeSteam = require('../../steam/decline');

const sendPushV3 = require('../../../helpers/sendPushV3');
const i18n = require('../../../languages');

const banCheck = async (data, ban) => {
  if (!data.user) {
    return;
  }

  const user = await User.findOne({ steamId: data.user });

  if (!user) {
    return;
  }

  if (ban && user.endMarketTrades < 50) {
    if (!user.closeMarketTrades) {
      user.closeMarketTrades = 0;
    }

    user.closeMarketTrades++;
    await User.updateOne({ _id: user._id }, { $set: { closeMarketTrades: user.closeMarketTrades + 1 } });
    let bannedTime;

    if (user.closeMarketTrades > 2) {
      bannedTime = Date.now() + 2 * 60 * 60 * 1000;
    }
    if (user.closeMarketTrades > 5) {
      bannedTime = Date.now() + 5 * 60 * 60 * 1000;
    }
    if (user.closeMarketTrades > 10) {
      bannedTime = Date.now() + 24 * 60 * 60 * 1000;
    }
    if (user.closeMarketTrades > 25) {
      bannedTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
    }

    if (user.closeMarketTrades === 1) {
      await sendPushV3(user, {
        type: 'INFO',
        title: i18n((user.locale || 'en').toLowerCase()).market.sellerCloseFirst.title,
        content: i18n((user.locale || 'en').toLowerCase()).market.sellerCloseFirst.content,
      });
    } else {
      await deleteSeller(user.steamId);

      const banDate = new Date(bannedTime);
      const banDateStr = `${banDate.getDate()}.${banDate.getMonth() + 1}.${banDate.getFullYear()}`;

      await sendPushV3(user, {
        type: 'INFO',
        title: i18n((user.locale || 'en').toLowerCase()).market.sellerClose.title,
        content: i18n((user.locale || 'en').toLowerCase()).market.sellerClose.content.replace('{date}', banDateStr),
      });
    }

    if (user.closeMarketTrades > 2) {
      await User.updateOne({ _id: user._id }, { $set: { marketBan: true, marketBanTime: bannedTime } });
    }

    console.log(`user ban ${user.steamId} ${user.closeMarketTrades}`);
    // eslint-disable-next-line no-await-in-loop
  }
};

const addBuyer = async trade => {
  // eslint-disable-next-line no-restricted-syntax
  for (const item of trade.itemsPartner) {
    // eslint-disable-next-line no-await-in-loop
    await MarketItem.updateMany({ assetid: item.assetid }, { $set: { buyer: trade.buyer } });
  }
};

const deleteUserFromMarket = async user => {
  const trades = await MarketTrade.find({ status: 'check', seller: user.steamId });
  // eslint-disable-next-line no-restricted-syntax
  for (const trade of trades) {
    // eslint-disable-next-line no-await-in-loop
    await changeTransaction(trade._id, 'close');
  }
  await MarketTrade.updateMany(
    { seller: user.steamId, status: 'check' },
    {
      $set: {
        status: 'close',
        closeReason: 'steam api key продавца недоступен, трейд отменен, не принимайте его в стим, баланс начислен не будет',
      },
    },
  );
  await User.updateOne({ _id: user._id }, { $set: { apiKey: null, oldApiKey: user.apiKey } });
};
const closeTrade = async (trade, closeReason) => {
  await MarketTrade.updateOne({ _id: trade._id }, { $set: { closeReason, status: 'close' } });
};

module.exports = async () => {
  const trades = await MarketTrade.find({ status: 'check', type: { $ne: 'bot' } });

  // eslint-disable-next-line no-restricted-syntax
  for (const trade of trades) {
    // eslint-disable-next-line no-await-in-loop
    const seller = await User.findOne({ steamId: trade.seller });
    // eslint-disable-next-line no-await-in-loop
    const buyer = await User.findOne({ steamId: trade.buyer });

    if (trade.isEscrow !== true && trade.createdAt < new Date(Date.now() - 12 * 60 * 60 * 1000)) {
      // eslint-disable-next-line no-await-in-loop
      await closeTrade(trade, 'trade old');
      // eslint-disable-next-line no-await-in-loop
      await clearReserver(trade);
      // eslint-disable-next-line no-await-in-loop
      await changeTransaction(trade._id, 'close');
      // eslint-disable-next-line no-await-in-loop
      await declineTradeSteam(seller.apiKey, trade.steamTradeId);
      // eslint-disable-next-line no-continue
      continue;
    }

    if (!seller) {
      // eslint-disable-next-line no-await-in-loop
      await closeTrade(trade, 'no seller found in ss');
      // eslint-disable-next-line no-await-in-loop
      await changeTransaction(trade._id, 'close');
      // eslint-disable-next-line no-continue
      continue;
    }

    if (!seller.apiKey) {
      // eslint-disable-next-line no-await-in-loop
      await deleteUserFromMarket(seller);
      // eslint-disable-next-line no-continue
      continue;
    }

    let steamTrade = null;

    try {
      // eslint-disable-next-line no-await-in-loop
      steamTrade = await getSteamTrade(seller.apiKey, trade.steamTradeId);

      if (!steamTrade && buyer.apiKey) {
        // eslint-disable-next-line no-await-in-loop
        steamTrade = await getSteamTrade(buyer.apiKey, trade.steamTradeId);
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

    if (res.status === 'wait') {
      // eslint-disable-next-line no-await-in-loop
      await MarketTrade.updateOne({ _id: trade._id }, { $set: { isEscrow: true } });
    }

    if (res.status === 'check') {
      // eslint-disable-next-line no-continue
      continue;
    }

    if (res.status === 'close') {
      if (!trade.send) {
        // eslint-disable-next-line no-await-in-loop
        await clearReserver(trade);
        // eslint-disable-next-line no-await-in-loop
        await changeTransaction(trade._id, 'close');
      }
      // eslint-disable-next-line no-await-in-loop
      await closeTrade(trade, res.reason);
      // eslint-disable-next-line no-await-in-loop
      await banCheck(res, res.user === trade.seller);
    }

    if (res.status === 'done') {
      // eslint-disable-next-line no-await-in-loop
      await User.updateOne({ _id: seller._id }, { $inc: { endMarketTrades: 1 } });
      if (trade.createdAt < new Date(Date.now() - 12 * 60 * 60 * 1000)) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (trade.status === 'close') {
        // eslint-disable-next-line no-continue
        continue;
      }
      // eslint-disable-next-line no-await-in-loop
      await addBuyer(trade);
      // eslint-disable-next-line no-await-in-loop
      await changeTransaction(trade._id, 'done');
      // eslint-disable-next-line no-await-in-loop
      await resetInventory(trade.buyer);
      // eslint-disable-next-line no-await-in-loop
      await resetInventory(trade.seller);
      // eslint-disable-next-line no-await-in-loop
      await MarketTrade.updateOne({ _id: trade._id }, { $set: { status: 'done' } });
    }
  }
};
