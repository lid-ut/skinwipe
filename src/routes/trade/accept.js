const ObjectId = require('mongoose').Types.ObjectId;
const changeMoney = require('../../helpers/changeMoney');
const sumMoneyTransactions = require('../../helpers/sumMoneyTransactions');
const generateUnicCode = require('../../helpers/generateUnicCode');
const UserNews = require('../../models/UserNews');
const Trade = require('../../models/Trade');
const User = require('../../models/User');
const MessageTrade = require('../../models/MessageTrade');
const Auction = require('../../models/Auction');

const addStat = require('../../helpers/addStat');

const config = require('../../../config');

const getUserItemsArray = require('../../helpers/getUserItemsArray');
const changeRating = require('../../helpers/changeRating');
const Settings = require('../../models/Settings');
const haveIos = require('../../helpers/haveIos');

const handleMoney = async trade => {
  const partner = await User.findOne({ steamId: trade.steamId });

  if (partner.money < trade.money) {
    return false;
  }

  const setting = await Settings.findOne({});
  let amountFee = (trade.money * setting.fee) / 100;
  if (amountFee < 1) {
    amountFee = 1;
  }
  if (amountFee + trade.money > partner.money) {
    return false;
  }
  await changeMoney(partner, 'buy_trade_p2p_direct', 'out', 'wait', trade._id, -1 * (trade.money - amountFee));
  await changeMoney(partner, 'buy_trade_p2p_direct_fee', 'out', 'wait', trade._id, -1 * amountFee);
  await sumMoneyTransactions(partner);
  const user = await User.findOne({ steamId: trade.steamIdPartner });
  await changeMoney(user, 'sell_trade_p2p_direct', 'in', 'new', trade._id, trade.money - amountFee);
  return true;
};

const acceptMessageTrade = async (params, tradeMessage) => {
  if (params.steamId === tradeMessage.steamId) {
    logger.error(
      `[TradesController][acceptMessageTrade] error - you can not accept your own trade ${params.steamId} ${tradeMessage.steamIdPartner}`,
    );
    return { status: 'error', code: 4, message: 'You can not accept your own trade' };
  }

  let newTrade = await Trade.findOne({
    steamId: tradeMessage.steamId,
    code: tradeMessage.code,
    steamIdPartner: tradeMessage.steamIdPartner,
  });
  if (!newTrade) {
    newTrade = new Trade({
      steamId: tradeMessage.steamId,
      code: tradeMessage.code,
      steamIdPartner: tradeMessage.steamIdPartner,
      user1: tradeMessage.user1,
      user2: tradeMessage.user2,
      myAllSkinsPrice: tradeMessage.myAllSkinsPrice,
      hisAllSkinsPrice: tradeMessage.hisAllSkinsPrice,
      items: tradeMessage.items,
      itemsPartner: tradeMessage.itemsPartner,
      status: 'accepted',
      close: false,
      difference: Math.round(tradeMessage.myAllSkinsPrice) - Math.round(tradeMessage.hisAllSkinsPrice),
      datecreate: Date.now(),
      dates: {
        created: new Date(),
        accepted: new Date(),
      },
      money: tradeMessage.money,
      steamTradeStatus: params.steamTradeStatus,
      steamTradeID: params.steamTradeID,
      notifications: {
        created: true,
      },
    });

    await newTrade.save();
  }

  await newTrade.updateOne(
    { _id: newTrade._id },
    { $set: { steamTradeStatus: params.steamTradeStatus, steamTradeID: params.steamTradeID } },
  );
  await UserNews.create(newTrade.steamId, 'trade', newTrade);

  tradeMessage.status = 'accepted';
  if (!tradeMessage.dates) tradeMessage.dates = {};
  tradeMessage.dates.accepted = new Date();
  tradeMessage.steamTradeStatus = params.steamTradeStatus;
  tradeMessage.steamTradeID = params.steamTradeID;
  await changeRating(params.user.steamId, config.ratingSettings.tradeAccept);
  if (newTrade.money > 0) {
    if ((await haveIos(tradeMessage.steamIdPartner)) || (await haveIos(tradeMessage.steamId))) {
      return { status: 'error', code: 4, message: 'Partner have no money' };
    }

    const res = await handleMoney(newTrade);
    if (!res) {
      return { status: 'error', code: 3, message: 'Partner have no money' };
    }
  }
  await tradeMessage.save();
  await addStat('tradesAccepted');
  return { status: 'success' };
};

const acceptAuctionTrade = async (params, auction) => {
  if (!auction) {
    logger.error('[TradesController][accept] auction not found');
    return { status: 'error', code: 3, message: 'auction not found' };
  }

  auction.bets = auction.bets.map(ab => {
    if (ab.tradeObject && ab.tradeObject._id && ab.tradeObject._id.toString() === params.tradeId) {
      ab.tradeObject.status = 'accepted';
      if (!ab.tradeObject.dates) ab.tradeObject.dates = {};
      ab.tradeObject.dates.accepted = new Date();
      ab.tradeObject.steamTradeStatus = params.steamTradeStatus;
      ab.tradeObject.steamTradeID = params.steamTradeID;
    } else if (ab.tradeObject) {
      ab.tradeObject.status = 'reject';
    }
    return ab;
  });

  auction.status = 'processed';
  await changeRating(params.user.steamId, config.ratingSettings.auctionBetAccept);
  await auction.save();
  return { status: 'success' };
};

const acceptTrade = async (params, trade) => {
  if (params.steamId === trade.steamId) {
    logger.error(`[accept][accept] error - you can not accept your own trade ${params.steamId} ${trade.steamIdPartner}`);
    return { status: 'error', code: 2, message: 'You can not accept your own trade' };
  }

  trade.status = 'accepted';
  if (!trade.dates) trade.dates = {};
  trade.dates.accepted = new Date();
  trade.steamTradeStatus = params.steamTradeStatus;
  trade.steamTradeID = params.steamTradeID;

  if (trade.autoTrade) {
    trade.user2 = params.user;
    trade.steamIdPartner = params.user.steamId;
    trade.accepted = true;
    const inventory = await getUserItemsArray(trade.steamIdPartner, true);

    trade.itemsPartner = trade.itemsPartner.map(item => {
      item.assetid = inventory.find(it => item.name === it.name).assetid;
      return item;
    });
    await changeRating(params.user.steamId, config.ratingSettings.superTradeAccept);

    if (trade.money > 0) {
      if ((await haveIos(trade.steamIdPartner)) || (await haveIos(trade.steamId))) {
        return { status: 'error', code: 4, message: 'Partner have no money' };
      }
      const setting = await Settings.findOne({});
      let amountFee = (trade.money * setting.fee) / 100;
      if (amountFee < 1) {
        amountFee = 1;
      }

      await changeMoney(params.user, 'sell_supertrade_p2p', 'in', 'new', trade._id, trade.money - amountFee);
    }
  } else {
    await changeRating(params.user.steamId, config.ratingSettings.tradeAccept);
  }

  await Trade.updateOne({ _id: trade._id }, { $set: trade });
  await addStat('tradesAccepted');
  return { status: 'success' };
};

module.exports = async function process(req) {
  const params = {
    user: req.user,
    steamId: req.user.steamId,
    tradeId: req.body.tradeId,
    steamTradeStatus: req.body.steamTradeStatus,
    steamTradeID: req.body.steamTradeID || '',
    appVersion: req.appVersion,
  };

  const trade = await Trade.findOne({ _id: params.tradeId, status: { $nin: ['reject', 'close', 'done', 'finished'] } });

  if (!trade) {
    const tradeMessage = await MessageTrade.findOne({ _id: params.tradeId, status: { $nin: ['reject', 'close', 'done', 'finished'] } });
    if (tradeMessage) {
      return acceptMessageTrade(params, tradeMessage);
    }
    const auctionTrade = await Auction.findOne({
      'bets.tradeObject._id': ObjectId(params.tradeId),
      'bets.tradeObject.status': 'new',
    });
    if (auctionTrade) {
      return acceptAuctionTrade(params, auctionTrade);
    }
    return { status: 'error', code: 0, message: 'trade not found' };
  }

  return acceptTrade(params, trade);
};
