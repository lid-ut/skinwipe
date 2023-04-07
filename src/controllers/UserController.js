const fetch = require('node-fetch');
const User = require('../models/User');
const UserSteamItems = require('../models/UserSteamItems');
const Trade = require('../models/Trade');
const Transaction = require('../models/Transaction');
const Auction = require('../models/Auction');
const TopLog = require('../models/TopLog');
const Promocode = require('../models/Promocode');
const FireCoin = require('../models/FireCoin');
const ActionPrice = require('../models/ActionPrice');
const specialCodes = require('../helpers/specialCodes');
const addStat = require('../helpers/addStat');
const changeCoins = require('../helpers/changeCoins');
const changeMoney = require('../helpers/changeMoney');
const sumMoneyTransactions = require('../helpers/sumMoneyTransactions');

const getUserBySteamId = async steamId => {
  if (!steamId) {
    logger.error('no steamid');
    return null;
  }
  const user = await User.findOne({ steamId }).lean();
  if (!user) {
    logger.error('no user');
    return null;
  }
  return user;
};

module.exports = class UserController {
  static async getTraderInfo(user) {
    const results = {
      gotTrades: 0,
      createdTrades: 0,
      finishedTrades: 0,
      acceptedTrades: 0,
      createdAutoTrades: 0,
      finishedAutoTrades: 0,
      createdAuctions: 0,
      finishedAuctions: 0,
      successfulAuctions: 0,
    };
    results.gotTrades = await Trade.countDocuments({
      steamIdPartner: user.steamId,
      autoTrade: { $ne: true },
    });
    results.createdTrades = await Trade.countDocuments({
      steamId: user.steamId,
      autoTrade: { $ne: true },
    });
    results.createdAutoTrades = await Trade.countDocuments({
      steamId: user.steamId,
      autoTrade: true,
    });
    results.finishedTrades = await Trade.countDocuments({
      $or: [{ steamId: user.steamId }, { steamIdPartner: user.steamId }],
      status: 'finished',
      autoTrade: { $ne: true },
    });
    results.acceptedTrades = await Trade.countDocuments({
      $or: [{ steamIdPartner: user.steamId }],
      status: 'finished',
      autoTrade: { $ne: true },
    });
    results.finishedAutoTrades = await Trade.countDocuments({
      $or: [{ steamId: user.steamId }, { steamIdPartner: user.steamId }],
      status: 'finished',
      autoTrade: true,
    });
    results.createdAuctions = await Auction.countDocuments({
      steamId: user.steamId,
    });
    results.finishedAuctions = await Auction.countDocuments({
      steamId: user.steamId,
      status: 'close',
    });
    results.successfulAuctions = await Auction.countDocuments({
      steamId: user.steamId,
      status: 'close',
      autoClose: null,
    });
    if (!user.stats) {
      user.stats = {};
    }
    // console.log(user.stats);
    await User.updateOne(
      { steamId: user.steamId },
      {
        $set: {
          stats: results,
        },
      },
    );
    return results;
  }

  static async getUserItemsForAutoTrade(user) {
    let items = await UserSteamItems.distinct('steamItems', { steamId: user.steamId }).lean();
    if (user.blackListedItems && user.blackListedItems.length) {
      const blItemsAssetIds = user.blackListedItems.map(it => it.assetid);
      items = items.filter(item => blItemsAssetIds.indexOf(item.assetid) === -1);
    }
    items = items.filter(item => item.tradable);
    return items;
  }

  static async getUserItemsNames(steamId) {
    let items = await UserSteamItems.distinct('steamItems', { steamId }).lean();
    items = items.filter(item => item.tradable).map(item => item.name);
    return items;
  }

  static async setSpecialCode(user, code, specialCode) {
    if (!user.specialCodes) {
      user.specialCodes = [];
    }

    if (user.specialCodes.indexOf(code) > -1) {
      logger.warn('[setSpecialCode] user already has code');
      return { error: { code: 10, message: 'you have entered this code before' } };
    }

    if (specialCode.group) {
      // eslint-disable-next-line no-restricted-syntax
      for (const key in specialCodes) {
        if (specialCodes[key].group === specialCode.group) {
          if (user.specialCodes.indexOf(key) > -1) {
            logger.warn('[setSpecialCode] user already has code');
            return { error: { code: 10, message: 'you have entered this code before' } };
          }
        }
      }
    }

    if (specialCode.registeredDaysCount) {
      const newUsersTime = new Date().getTime() - specialCode.registeredDaysCount * 24 * 60 * 60 * 1000;
      if (new Date(user.createdAt).getTime() < newUsersTime) {
        return { error: { code: 12, coinCountmessage: 'limit reached' } };
      }
    }

    if (specialCode.validFrom || specialCode.validTo) {
      if (specialCode.validFrom && specialCode.validFrom > Date.now()) {
        return { error: { code: 12, message: 'limit reached' } };
      }
      if (specialCode.validTo && specialCode.validTo < Date.now()) {
        return { error: { code: 12, message: 'limit reached' } };
      }
    }

    if (specialCode.limit) {
      const entersCount = await User.countDocuments({ specialCodes: code });
      if (specialCode.limit <= entersCount) {
        logger.warn('[setSpecialCode] code enter limit reached');
        return { error: { code: 12, message: 'limit reached' } };
      }
    }

    user.specialCodes.push(code);
    // if (specialCode.type === 'coins') {
    //   await changeCoins(user, 'specialCode', specialCode.amount);
    // }
    if (specialCode.type === 'fireCoins' || specialCode.type === 'coins') {
      await new FireCoin({
        steamId: user.steamId,
        reason: `code-${code}`,
        amount: specialCode.amount,
        used: 0,
        expiration: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }).save();
      await addStat('fireCoinsAdded', specialCode.amount);
    }
    if (specialCode.type === 'premium') {
      await UserController.givePremium(user, code, specialCode.days);
    }
    if (specialCode.type === 'skin') {
      if (!user.tradeUrl) {
        return { error: { code: 14, message: 'not tradeUrl' } };
      }
      await UserController.getSkin(user, specialCode.appId, specialCode.max, specialCode.min, code);
    }
    if (specialCode.type === 'money') {
      await changeMoney(user, 'promo', 'in', 'done', code, specialCode.amount);
      await sumMoneyTransactions(user);
    }
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          specialCodes: user.specialCodes,
        },
      },
    );
    return { error: null, coins: specialCode.amount, codeType: specialCode.type };
  }

  static async handleCustomCode(user, promo) {
    if (!user.specialCodes) {
      user.specialCodes = [];
    }

    const codeInfo = await Promocode.findOne({ promo });

    if (!codeInfo) {
      return { error: { code: 12, message: 'limit reached' } };
    }

    if (codeInfo.validTo && new Date(codeInfo.validTo).getTime() < Date.now()) {
      return { error: { code: 12, message: 'limit reached' } };
    }

    // if (codeInfo.code_type === 'coins') {
    //   await changeCoins(user, 'specialCode', codeInfo.amount);
    // }
    if (codeInfo.code_type === 'fireCoins' || codeInfo.code_type === 'coins') {
      await new FireCoin({
        steamId: user.steamId,
        reason: `customCode-${promo}`,
        amount: codeInfo.amount,
        used: 0,
        expiration: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }).save();
      await addStat('fireCoinsAdded', codeInfo.amount);
    }

    if (codeInfo.code_type === 'skin') {
      if (!user.tradeUrl) {
        return { error: { code: 12, message: 'not tradeUrl' } };
      }
      const min = Math.round(codeInfo.amount - codeInfo.amount * 0.1);
      const max = Math.round(codeInfo.amount + codeInfo.amount * 0.1);

      await UserController.getSkin(user, 730, max, min, promo);
    }

    if (codeInfo.code_type === 'premium') {
      await UserController.givePremium(user, promo, codeInfo.amount);
    }

    if (codeInfo.code_type === 'money') {
      await changeMoney(user, 'promo_custom', 'in', 'done', promo, codeInfo.amount);
      await sumMoneyTransactions(user);
    }

    user.specialCodes.push(promo);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          specialCodes: user.specialCodes,
        },
      },
    );

    await Promocode.deleteOne({ promo });

    return { error: null, coins: codeInfo.amount, codeType: codeInfo.code_type };
  }

  static async setInvitationCode(user, code) {
    if (!user || !user.steamId) {
      return { error: { code: 2 } };
    }

    if (Object.keys(specialCodes).indexOf(code) > -1) {
      return UserController.setSpecialCode(user, code, specialCodes[code]);
    }

    if ((code.indexOf('vk') === 0 || code.indexOf('re') === 0 || code.indexOf('tw') === 0 || code.indexOf('up') === 0) && code.length > 8) {
      return UserController.handleCustomCode(user, code);
    }

    // Проверить что код существует
    const inviter = await User.findOne({ myInvitationCode: code.toLowerCase() });
    if (!inviter || !inviter.steamId) {
      return { error: { code: 3, message: 'no inviter' } };
    }

    if (inviter.steamId === user.steamId) {
      return { error: { code: 4, message: 'same user' } };
    }

    if (inviter.invitationCode === user.myInvitationCode) {
      return { error: { code: 5, message: 'cross-invite' } };
    }

    if (user.ipAddress && inviter.ipAddress === user.ipAddress) {
      return { error: { code: 4, message: 'same user' } };
    }

    const sameIpUser = await User.findOne({ invitationCode: code.toLowerCase(), ipAddress: user.ipAddress });
    if (sameIpUser) {
      return { error: { code: 4, message: 'same user' } };
    }

    // Проверить что у юзера ещё нет invitationCode
    if (user.invitationCode && user.invitationCode.length) {
      return { error: { code: 1 } };
    }

    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    if (new Date(user.createdAt).getTime() < dayAgo) {
      return { error: { code: 7 } };
    }

    await changeMoney(user, 'invite', 'invited', 'done', code, 5);
    await sumMoneyTransactions(user);
    await changeMoney(inviter, 'invite', 'inviter', 'done', code, 5);
    await sumMoneyTransactions(inviter);
    // await UserController.getSkin(inviter, 730, 2, 1, 'bringFriend');

    if (!user.friends) {
      user.friends = [];
    }
    user.friends.push(inviter.steamId);
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          invitationCode: code,
          friends: user.friends,
        },
      },
    );
    if (!inviter.friends) {
      inviter.friends = [];
    }
    inviter.friends.push(user.steamId);
    await User.updateOne({ _id: inviter._id }, { $set: { friends: (inviter.mySkinInvitationPoints || 0) + 1 } });
    return { error: null, coins: 50 };
  }

  static async givePremium(user, code, days) {
    if (!user.subInfo) {
      user.subInfo = [];
    }
    let startTime = Date.now();
    for (let i = 0; i < user.subInfo.length; i++) {
      const subExpiration = parseInt(user.subInfo[i].expirationTime || user.subInfo[i].expiration || user.subInfo[i].expiresDateMs, 10);
      if (subExpiration > startTime) {
        startTime = subExpiration;
      }
    }
    user.subInfo.push({
      code,
      subType: 'backend',
      store: 'promo',
      token: `backend-${user.steamId}-${code}`,
      dateCreate: new Date(),
      screen: 'no screen',
      productId: 'backend_skinswipe',
      transactionId: null,
      originalTransactionId: null,
      purchaseDate: Date.now(),
      purchaseDateMs: Date.now(),
      startTime: new Date(startTime).getTime(),
      expirationTime: new Date(startTime).getTime() + days * 24 * 60 * 60 * 1000,
      start: new Date(startTime).getTime(),
      expiration: new Date(startTime).getTime() + days * 24 * 60 * 60 * 1000,
    });
    user.subscriber = true;
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          subInfo: user.subInfo,
          subscriber: user.subscriber,
        },
      },
    );
  }

  static async checkInactive(steamId) {
    // const transaction = await Transaction.findOne({
    //   user_steam_id: steamId,
    //   token: 'inactive',
    // }).lean();
    // return !!transaction;
  }

  static async changeTopPoints(steamId, rating, logEntry) {
    const tn = new Date();
    tn.setHours(0);
    tn.setMinutes(0);
    const oldLog = await TopLog.findOne({
      action: logEntry.action,
      steamId,
      partnerSteamId: logEntry.partnerSteamId,
      createdAt: {
        $gt: tn,
      },
    });
    if (oldLog) {
      return;
    }
    const user = await getUserBySteamId(steamId);
    if (!user.topPoints) {
      user.topPoints = 0;
    }
    await User.updateOne(
      { _id: user._id },
      {
        $set: { topPoints: user.topPoints + rating },
      },
    );
    const log = new TopLog(logEntry);
    await log.save();
  }

  static getSkin(user, appId, max, min, promo) {
    if (appId === 'random') {
      appId = [570, 730][Math.round(Math.random())];
    }

    return fetch('http://116.203.25.254/api/need/add', {
      method: 'POST',
      body: JSON.stringify({
        steamId: user.steamId,
        userTradeUrl: user.tradeUrl,
        appId,
        min,
        max,
        promo,
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'botmaster-token': '97daLcPSmYNM5cCDK3g8uv',
      },
    });
  }

  static async getPublicInfo(user, steamId) {
    const userPartner = await User.findOne(
      { steamId },
      {
        steamId: 1,
        allSkinsCount: 1,
        allSkinsPrice: 1,
        personaname: 1,
        avatarfull: 1,
        subscriber: 1,
        statusMessage: 1,
        locale: 1,
        lastActiveDate: 1,
      },
    ).lean();
    if (!userPartner) {
      return {
        userPartner: {},
        gamesList: [],
        isFriend: false,
      };
    }

    const tradesInfo = await UserController.getTraderInfo(userPartner);

    userPartner.createdTrades = tradesInfo.createdTrades;
    userPartner.finishedTrades = tradesInfo.finishedTrades;
    userPartner.createdAutoTrades = tradesInfo.createdAutoTrades;
    userPartner.finishedAutoTrades = tradesInfo.finishedAutoTrades;
    delete userPartner.stats;

    // isFriend
    const gamesList = [];

    const dotaItems = await UserSteamItems.findOne({ steamId: userPartner.steamId, appId: '570' }, { steamItems: 1 });
    if (dotaItems && dotaItems.steamItems && dotaItems.steamItems.length) {
      gamesList.push('DotA 2');
    }
    const csgoItems = await UserSteamItems.findOne({ steamId: userPartner.steamId, appId: '730' }, { steamItems: 1 });
    if (csgoItems && csgoItems.steamItems && csgoItems.steamItems.length) {
      gamesList.push('CS:GO');
    }

    const isFriend = (user.friends || []).findIndex(stid => stid === userPartner.steamId) > -1;

    return {
      userPartner,
      gamesList,
      isFriend,
    };
  }

  static getSpecialOffers(user) {
    // if (user.gotPremiumAfterTradeBan) {
    //   let subscription = user.subInfo.find(function (item) {
    //     return item.code === 'firstPremiumAfterTradeBan';
    //   });
    //   if (subscription) {
    //     let hasSpecialOffer = subscription.expirationTime >= new Date().getTime();
    //     return {
    //       has_special_offer: hasSpecialOffer,
    //       special_offer: {
    //         last_chance_date: new Date(+subscription.expirationTime),
    //       },
    //     };
    //   }
    // }`
    // if (user.gotPremiumDiscountAfterInactive && user.gotPremiumDiscountDateStart > new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) {
    //   return {
    //     has_special_offer: true,
    //     special_offer: {
    //       last_chance_date: new Date(+new Date(user.gotPremiumDiscountDateStart) + 2 * 24 * 60 * 60 * 1000),
    //     },
    //   };
    // }
    if (user.showTrialCancelledSpecialOffer && +new Date(user.trialCancelledSpecialOfferLastChance) >= +new Date()) {
      return {
        has_special_offer: true,
        special_offer: {
          last_chance_date: user.trialCancelledSpecialOfferLastChance,
        },
      };
    }
    return {
      has_special_offer: false,
    };
  }

  static async getActionPrices() {
    const prices = await ActionPrice.find({});
    return prices;
  }
};
