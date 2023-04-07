const ObjectId = require('mongoose').Types.ObjectId;

const User = require('../models/User');
const Like = require('../models/Like');
const UserSteamItems = require('../models/UserSteamItems');
const Trade = require('../models/Trade');
const MessageTrade = require('../models/MessageTrade');
const MoneyTransaction = require('../models/MoneyTransaction');
const Auction = require('../models/Auction');
const UserSkinRecommendation = require('../models/UserSkinRecommendation');
const changeTransaction = require('../modules/money/transaction/change');
const UserController = require('./UserController');

const getUserItems = require('../helpers/getUserItems');
const changeRating = require('../helpers/changeRating');
const resetInventory = require('../helpers/resetInventory');
const getShortUserInfo = require('../helpers/getShortUserInfo');
const changeMoney = require('../helpers/changeMoney');
const sumMoneyTransactions = require('../helpers/sumMoneyTransactions');

const config = require('../../config');

const sortItemsByPrice = (a, b) => {
  if (!a.price || !a.price.steam || !a.price.steam.mean) {
    return -1;
  }
  if (!b.price || !b.price.steam || !b.price.steam.mean) {
    return 1;
  }
  if (a.price.steam.mean < b.price.steam.mean) {
    return 1;
  }
  if (a.price.steam.mean > b.price.steam.mean) {
    return -1;
  }
  return 0;
};

module.exports = class TradesController {
  static async getAllItemsDataForTrade(params) {
    const userMe = params.user;
    const userHe = await User.findOne({
      steamId: params.partnerSteamID,
    }).lean();
    const myLimit = params.myLimit;
    const hisLimit = params.hisLimit;
    const myOffset = params.myOffset;
    const hisOffset = params.hisOffset;
    const filters = params.filters;
    const filtersPartner = params.filtersPartner;

    const myItems = await getUserItems({
      user: userMe,
      filters,
      limit: myLimit,
      offset: myOffset,
    });

    if (!userHe) {
      logger.error(`[TradesController] userHe is not defined (${params.partnerSteamID})`);
      return {
        his: {},
        myItems,
        hisItems: [],
        myOffset: parseInt(myOffset, 10) + myItems ? myItems.length : 0,
        hisOffset: 0,
        myItemsCount: userMe.allSkinsCount,
        hisItemsCount: 0,
      };
    }

    if (!userMe.bans) {
      userMe.bans = {};
    }
    if (!userHe.bans) {
      userHe.bans = {};
    }

    if ((userHe.blacklist || []).find(sid => sid === userMe.steamId)) {
      for (let i = 0; i < myItems.length; i++) {
        myItems[i].tradable = false;
      }
    }

    for (let i = 0; i < myItems.length; i++) {
      const gameName = config.steam.games_names[myItems[i].appid];
      if (userMe.bans[gameName] || userHe.bans[gameName]) {
        myItems[i].tradable = false;
      }
    }

    const hisItems = await getUserItems({
      user: userHe,
      filters: filtersPartner,
      limit: hisLimit,
      offset: hisOffset,
    });

    const hisLikes = await Like.find({
      entityId: {
        $in: hisItems.map(it => it.assetid),
      },
      entityType: 'skin',
    }).lean();
    const myHisLikes = hisLikes.filter(l => l.steamId === userMe.steamId);

    const myLikes = await Like.find({
      entityId: {
        $in: myItems.map(it => it.assetid),
      },
      entityType: 'skin',
    }).lean();

    for (let i = 0; i < hisItems.length; i++) {
      const gameName = config.steam.games_names[hisItems[i].appid];
      if (userMe.bans[gameName] || userHe.bans[gameName]) {
        hisItems[i].tradable = false;
      }
      hisItems[i].likes = hisLikes.filter(l => l.entityId === hisItems[i].assetid).length;
      hisItems[i].didILikeThis = myHisLikes.filter(l => l.entityId === hisItems[i].assetid).length > 0;
      hisItems[i].imageWithStickers = [];
    }

    if (!userHe.blackListedItems) {
      userHe.blackListedItems = [];
    }

    for (let i = 0; i < hisItems.length; i++) {
      if (userHe.blackListedItems.find(bli => bli.assetid === hisItems[i].assetid)) {
        hisItems[i].tradable = false;
      }
    }

    for (let i = 0; i < myItems.length; i++) {
      myItems[i].likes = myLikes.filter(l => l.entityId === myItems[i].assetid).length;
      myItems[i].imageWithStickers = [];
    }

    return {
      his: userHe,
      myItems,
      hisItems,
      myOffset: parseInt(myOffset, 10) + myItems ? myItems.length : 0,
      hisOffset: parseInt(hisOffset, 10) + hisItems ? hisItems.length : 0,
      myItemsCount: userMe.allSkinsCount,
      hisItemsCount: userHe.allSkinsCount,
    };
  }

  static async rejectMessageTrade(params, tradeMessage) {
    if (tradeMessage.status !== 'new') {
      return {
        result: 'error',
        message: 'access denied',
      };
    }
    if (tradeMessage.steamId !== params.steamId && tradeMessage.steamIdPartner !== params.steamId) {
      return {
        result: 'error',
        message: 'access denied',
      };
    }
    tradeMessage.status = 'reject';
    await changeRating(params.user.steamId, config.ratingSettings.tradeReject);
    await tradeMessage.save();
    await sumMoneyTransactions(tradeMessage.user1);
    await sumMoneyTransactions(tradeMessage.user2);
    return {
      result: 'success',
    };
  }

  static async reject(params) {
    const trade = await Trade.findOne({
      _id: params.tradeId,
    }).populate('user1 user2');

    if (!trade) {
      const tradeMessage = await MessageTrade.findOne({
        _id: ObjectId(params.tradeId),
      }).populate('user1 user2');
      if (tradeMessage) {
        await changeTransaction(params.tradeId, 'close', 'decline trade');
        return TradesController.rejectMessageTrade(params, tradeMessage);
      }
      return {
        error: 'trade not found',
      };
    }

    if (
      (trade.steamId === params.steamId && trade.createdAt.getTime() < Date.now() - 60 * 1000) ||
      trade.steamIdPartner === params.steamId
    ) {
      if (trade.autoTrade && trade.steamIdPartner === params.steamId) {
        trade.steamIdPartner = null;
        trade.user2 = null;
        trade.usersReject.push(params.steamId);
        trade.steamTradeStatus = null;
        trade.steamTradeID = null;
        trade.dates.accepted = null;
        trade.dates.steamLastSendPushCheck = null;
        await changeRating(params.user.steamId, config.ratingSettings.superTradeReject);
      } else if (trade.status === 'new') {
        trade.status = 'reject';
        await changeTransaction(params.tradeId, 'close', 'decline trade');
        if (params.steamError) {
          trade.steamError = params.steamError;
        }
        trade.userClose = params.steamId;
        trade.steamTradeStatus = params.steamTradeStatus;
        // Не отправлять пуш о том что трейд отклонён
        if (params.steamId === trade.steamId) {
          if (!trade.notifications) {
            trade.notifications = {};
          }
          trade.notifications.rejected = true;
        }
        // trade.steamTradeComment = steamTradeInfo;
        if (!trade.auctionId) {
          await changeRating(params.user.steamId, config.ratingSettings.tradeReject);
        } else {
          const auction = await Auction.findOne({
            _id: trade.auctionId,
          });
          if (auction) {
            auction.status = 'open';
            await auction.save();
            await changeRating(params.user.steamId, config.ratingSettings.auctionBetReject);
          }
        }
      }
    } else if (trade.autoTrade) {
      trade.usersReject.push(params.steamId);
    }
    await sumMoneyTransactions(trade.user1);
    await sumMoneyTransactions(trade.user2);

    await trade.save();
    return {
      result: 'success',
    };
  }

  static async pushSteamAuctionStatus(params, auction) {
    const j = auction.bets.findIndex(ab => {
      return ab.tradeObject && ab.tradeObject._id.toString() === params.tradeId;
    });

    if (j === -1) {
      return {
        error: 'trade not found',
      };
    }

    if (auction.bets[j].steamId !== params.steamId && auction.steamId !== params.steamId) {
      return {
        error: 'not your trade',
      };
    }

    if (params.steamStatus === 'rejected') {
      for (let i = 0; i < auction.bets.length; i++) {
        if (!auction.bets[i].tradeObject) {
          auction.bets[i].tradeObject = {};
        }
        auction.bets[i].tradeObject.status = 'new';
        auction.bets[i].tradeObject.notifications = {
          created: true,
        };
      }
      auction.status = 'open';
      await auction.save();
      return {
        result: 'success',
      };
    }

    auction.bets[j].tradeObject.steamTradeStatus = params.steamStatus;
    if (params.steamStatus === 'accepted') {
      auction.bets[j].tradeObject.status = 'finished';
      if (!auction.bets[j].tradeObject.dates) {
        auction.bets[j].tradeObject.dates = {};
      }
      auction.bets[j].tradeObject.dates.finished = new Date();
      auction.status = 'close';
      await resetInventory(auction.bets[j].steamId);
      await resetInventory(auction.steamId);

      await UserController.changeTopPoints(auction.bets[j].steamId, config.topSettings.tradeFinished, {
        action: 'finishedAuction',
        steamId: auction.bets[j].steamId,
        partnerSteamId: auction.steamId,
        amount: config.topSettings.tradeFinished,
      });
      await UserController.changeTopPoints(auction.steamId, config.topSettings.tradeFinished, {
        action: 'finishedAuction',
        steamId: auction.steamId,
        partnerSteamId: auction.bets[j].steamId,
        amount: config.topSettings.tradeFinished,
      });
    }
    await auction.save();
    return {
      result: 'success',
    };
  }

  static async pushSteamTradeStatus(params) {
    let trade = await Trade.findOne({
      _id: params.tradeId,
      status: {
        $ne: 'finished',
      },
    });

    if (!trade) {
      trade = await MessageTrade.findOne({
        _id: params.tradeId,
        status: {
          $ne: 'finished',
        },
      });
    }

    if (!trade) {
      const auction = await Auction.findOne({
        'bets.tradeObject._id': ObjectId(params.tradeId),
        status: {
          $ne: 'close',
        },
      });
      if (auction) {
        return TradesController.pushSteamAuctionStatus(params, auction);
      }
      return {
        error: 'trade not found',
      };
    }

    if (trade.steamId !== params.steamId && trade.steamIdPartner !== params.steamId) {
      return {
        error: 'not your trade',
      };
    }

    trade.steamTradeStatus = params.steamStatus;

    // if (params.steamStatus === 'accepted') {
    //   trade.status = 'finished';
    //   await resetInventory(trade.steamIdPartner);
    //   await resetInventory(trade.steamId);
    //
    //   // if (trade.money) {
    //   //   const partner = await User.findOne({ steamId: trade.steamIdPartner });
    //   //   await changeMoney(partner, 'done', trade._id, trade.money, { type: 'p2p', status: 'out' });
    //   //   await sumMoneyTransactions(partner);
    //   // }
    //
    //   if (trade.steamIdPartner) {
    //     await UserController.changeTopPoints(trade.steamIdPartner, config.topSettings.tradeFinished, {
    //       action: 'tradeFinished',
    //       steamId: trade.steamIdPartner,
    //       partnerSteamId: trade.steamId,
    //       amount: config.topSettings.tradeFinished,
    //     });
    //   }
    //   await UserController.changeTopPoints(trade.steamId, config.topSettings.tradeFinished, {
    //     action: 'tradeFinished',
    //     steamId: trade.steamId,
    //     partnerSteamId: trade.steamIdPartner,
    //     amount: config.topSettings.tradeFinished,
    //   });
    // }

    await trade.save();
    return {
      result: 'success',
    };
  }

  static async getCountItemsOnUsers(user, itemsNames) {
    const count = await UserSteamItems.countDocuments({
      'steamItems.name': {
        $in: itemsNames,
      },
    });
    return count || 0;
  }

  static generateTradeQuery(params, steamId) {
    let result;
    switch (params.type) {
      case 'history':
        result = {
          $or: [
            {
              steamId,
            },
            {
              partnersSteamIds: {
                $in: [steamId],
              },
            },
          ],
        };
        break;

      case 'my':
        result = {
          steamId,
        };
        break;
      case 'partner':
        result = {
          status: { $ne: 'reject' },
          steamIdPartner: steamId,
        };
        if (params.sortBy) {
          result.steamId = {
            $ne: steamId,
          };
        }
        break;
      default:
        result = {
          $or: [
            {
              steamId,
            },
            {
              steamIdPartner: steamId,
            },
          ],
        };
        if (!params.typeStatus || params.typeStatus.length === -1) {
          result.status = {
            $nin: ['finished', 'reject'],
          };
        }
        if (params.sortBy) {
          result.steamId = {
            $ne: steamId,
          };
        }
        break;
    }
    return result;
  }

  static generateAutotradeQuery(params, steamId, blackList, itemsUser1) {
    let result;
    switch (params.type) {
      case 'history':
        result = {
          $or: [
            {
              steamId,
            },
            {
              partnersSteamIds: {
                $in: [steamId],
              },
            },
          ],
          autoTrade: true,
        };
        break;
      case 'my':
        result = {
          steamId,
          autoTrade: true,
        };
        break;
      case 'partner':
        result = {
          status: { $nin: ['new', 'reject', 'finished'] },
          partnersSteamIds: {
            $in: [steamId],
          },
          usersReject: {
            $ne: steamId,
          },
          autoTrade: true,
          accepted: false,
        };

        if (blackList.length > 0) {
          result.steamId = {
            $nin: blackList,
          };
        }
        if (itemsUser1 && itemsUser1.length) {
          result['items.name'] = { $in: itemsUser1 };
        }
        break;
      default:
        result = {
          partnersSteamIds: {
            $in: [steamId],
          },
          usersReject: {
            $ne: steamId,
          },
          autoTrade: true,
          accepted: false,
        };
        if (blackList.length > 0) {
          result.steamId = {
            $nin: blackList,
          };
        }

        if (itemsUser1 && itemsUser1.length) {
          result['items.name'] = { $in: itemsUser1 };
        }
        if (!params.typeStatus || params.typeStatus.length === -1) {
          result.status = {
            $nin: ['finished', 'reject'],
          };
        }
        if (params.sortBy) {
          result.steamId = {
            $ne: steamId,
            $nin: blackList,
          };
        }
        break;
    }
    return result;
  }

  static addFiltersToQuery(query, params, isAutoTrade = false) {
    const findObj = {
      ...query,
    };
    if (params.filters) {
      if (params.filters.price && (params.filters.price.min || params.filters.price.max)) {
        findObj.myAllSkinsPrice = {
          $gte: params.filters.price.min || 0,
          $lte: params.filters.price.max || 9999999,
        };
      }

      if (params.filters.name && params.filters.name.length) {
        if (/^[a-zA-Z0-9|\s()™★-]*$/.test(params.filters.name)) {
          if (!findObj.items) {
            findObj.items = {
              $elemMatch: {},
            };
          }
          findObj.items.$elemMatch.name = {
            $regex: params.filters.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
            $options: 'i',
          };
        }
      }

      if (params.filters.dota2) {
        if (!findObj.items) {
          findObj.items = {
            $elemMatch: {},
          };
        }
        findObj.items.$elemMatch.appid = 570;

        if (params.filters.dota2.assetid && params.filters.dota2.assetid.length && !isAutoTrade) {
          findObj.items.$elemMatch.assetid = {
            $in: params.filters.dota2.assetid,
          };
        }
        if (params.filters.dota2.type && params.filters.dota2.type.length) {
          findObj.items.$elemMatch.Type = {
            $regex: params.filters.dota2.type.join('|'),
          };
        }
        if (params.filters.dota2.quality && params.filters.dota2.quality.length) {
          findObj.items.$elemMatch.Quality = {
            $regex: params.filters.dota2.quality.join('|'),
          };
        }
        if (params.filters.dota2.rarity && params.filters.dota2.rarity.length) {
          findObj.items.$elemMatch.Rarity = {
            $regex: params.filters.dota2.rarity.join('|'),
          };
        }
        if (params.filters.dota2.hero && params.filters.dota2.hero.length) {
          findObj.items.$elemMatch.Hero = {
            $regex: params.filters.dota2.hero.join('|'),
          };
        }
        if (params.filters.dota2.slot && params.filters.dota2.slot.length) {
          findObj.items.$elemMatch.Slot = {
            $regex: params.filters.dota2.slot.join('|'),
          };
        }
        if (params.filters.dota2.runeNames && params.filters.dota2.runeNames.length) {
          findObj.items.$elemMatch.runeNames = {
            $elemMatch: {
              $regex: params.filters.dota2.runeNames.join('|'),
            },
          };
        }
      }

      if (params.filters.csgo) {
        if (!findObj.items) {
          findObj.items = {
            $elemMatch: {},
          };
        }
        findObj.items.$elemMatch.appid = 730;
        if (params.filters.csgo.assetid && params.filters.csgo.assetid.length && !isAutoTrade) {
          findObj.items.$elemMatch.assetid = {
            $in: params.filters.csgo.assetid,
          };
        }
        if (params.filters.csgo.float && (params.filters.csgo.float.from !== 0 || params.filters.csgo.float.to !== 1000)) {
          findObj.items.$elemMatch.float = {
            $ne: null,
          };
          if (params.filters.csgo.float.from) {
            findObj.items.$elemMatch.float.$gte = (params.filters.csgo.float.from / 1000).toString();
          }
          if (params.filters.csgo.float.to) {
            findObj.items.$elemMatch.float.$lte = (params.filters.csgo.float.to / 1000).toString();
          }
        }
        if (params.filters.csgo.statTrack) {
          findObj.items.$elemMatch.Quality = 'stattrak™';
        }
        if (params.filters.csgo.weapon && params.filters.csgo.weapon.length) {
          findObj.items.$elemMatch.Weapon = {
            $regex: params.filters.csgo.weapon.join('|'),
          };
        }
        if (params.filters.csgo.exterior && params.filters.csgo.exterior.length) {
          findObj.items.$elemMatch.Exterior = {
            $regex: params.filters.csgo.exterior.join('|'),
          };
        }
        if (params.filters.csgo.stickerCount) {
          findObj.items.$elemMatch.stickerNames = {
            $size: params.filters.csgo.stickerCount,
          };
        }
        if (params.filters.csgo.stickerNames && params.filters.csgo.stickerNames.length) {
          findObj.items.$elemMatch.stickerNames = {
            ...(findObj.items.$elemMatch.stickerNames || {}),
            // eslint-disable-next-line no-useless-escape
            $regex: params.filters.csgo.stickerNames.map(item => item.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|'),
            $options: 'i',
          };
        }
        if (params.filters.csgo.quality && params.filters.csgo.quality.length) {
          findObj.items.$elemMatch.Quality = {
            $regex: params.filters.csgo.quality.join('|'),
          };
        }
        if (params.filters.csgo.type && params.filters.csgo.type.length) {
          findObj.items.$elemMatch.Type = {
            $regex: params.filters.csgo.type.join('|'),
          };
        }
        if (params.filters.csgo.paintSeed && params.filters.csgo.paintSeed.length) {
          findObj.items.$elemMatch.float = {
            $elemMatch: {
              paintSeed: {
                $in: params.filters.csgo.paintSeed,
              },
            },
          };
        }
      }

      if (params.filters.tf2) {
        if (!findObj.items) {
          findObj.items = {
            $elemMatch: {},
          };
        }
        findObj.items.$elemMatch.appid = 440;
        if (params.filters.tf2.assetid && params.filters.tf2.assetid.length && !isAutoTrade) {
          findObj.items.$elemMatch.assetid = {
            $in: params.filters.tf2.assetid,
          };
        }
        if (params.filters.tf2.class && params.filters.tf2.class.length > 0) {
          findObj.items.$elemMatch.Class = {
            $regex: params.filters.tf2.class.join('|'),
          };
        }
        if (params.filters.tf2.quality && params.filters.tf2.quality.length) {
          findObj.items.$elemMatch.Quality = {
            $regex: params.filters.tf2.quality.join('|'),
          };
        }
        if (params.filters.tf2.weapon && params.filters.tf2.weapon.length) {
          findObj.items.$elemMatch.Weapon = {
            $regex: params.filters.tf2.weapon.join('|'),
          };
        }
        if (params.filters.tf2.type && params.filters.tf2.type.length) {
          findObj.items.$elemMatch.Type = {
            $regex: params.filters.tf2.type.join('|'),
          };
        }
      }
    }
    return findObj;
  }

  static generateAllTradesParams(user, params, ItemsNames, itemsUser1 = null) {
    let autotrade = TradesController.generateAutotradeQuery(params, user.steamId, user.blacklist || [], itemsUser1 || []);
    let neautotrade = TradesController.generateTradeQuery(params, user.steamId);
    autotrade = TradesController.addFiltersToQuery(autotrade, params, true);
    neautotrade = TradesController.addFiltersToQuery(neautotrade, params, false);

    const res = {
      $or: [autotrade, neautotrade],
    };

    if (params.type !== 'history') {
      res.close = { $ne: true };
    }

    return res;
  }

  static async getAllTrades(user, params) {
    const ItemsNames = await UserController.getUserItemsNames(user.steamId);
    const findObj = TradesController.generateAllTradesParams(user, params, ItemsNames);

    let sortObj = {
      raisedAt: -1,
    };
    if (params.sortBy === 'difference') {
      if (params.type === 'my') {
        sortObj = {
          difference: params.sortOrder * -1,
        };
      } else {
        sortObj = {
          difference: params.sortOrder,
        };
      }
    }
    if (params.sortBy === 'price') {
      if (params.type === 'my') {
        sortObj = {
          hisAllSkinsPrice: params.sortOrder,
        };
      } else {
        sortObj = {
          myAllSkinsPrice: params.sortOrder,
        };
      }
    }

    const trades = await Trade.find(findObj)
      .populate('user1 user2')
      .sort(sortObj)
      .skip(params.offset || 0)
      .limit(params.limit || 10)
      .lean()
      .exec();

    if (!trades) {
      return [];
    }

    const itemsWithAssetId = await UserController.getUserItemsForAutoTrade(user);
    return TradesController.processTradesList(trades, user, itemsWithAssetId);
  }

  static async getAllTradesV2(user, params) {
    const ItemsNames = await UserController.getUserItemsNames(user.steamId);
    let recommendedItemsNames = [];
    const findObj = TradesController.generateAllTradesParams(user, params, ItemsNames);
    const recommendations = await UserSkinRecommendation.find({ steamId: user.steamId });
    const recommendationParams = { ...params };
    if (!recommendationParams.filters) {
      recommendationParams.filters = {};
    }
    for (let i = 0; i < recommendations.length; i++) {
      recommendedItemsNames = recommendedItemsNames.concat(recommendations[i].skinsNames);
      // eslint-disable-next-line eqeqeq
      if (recommendations[i].appId == 440) {
        recommendationParams.filters.tf2 = {
          ...(recommendationParams.filters.tf2 || {}),
          assetid: recommendations[i].skinsAssetIds,
        };
      }
      // eslint-disable-next-line eqeqeq
      if (recommendations[i].appId == 570) {
        recommendationParams.filters.dota2 = {
          ...(recommendationParams.filters.dota2 || {}),
          assetid: recommendations[i].skinsAssetIds,
        };
      }
      // eslint-disable-next-line eqeqeq
      if (recommendations[i].appId == 730) {
        recommendationParams.filters.csgo = {
          ...(recommendationParams.filters.csgo || {}),
          assetid: recommendations[i].skinsAssetIds,
        };
      }
    }

    let sortObj = {
      raisedAt: -1,
    };
    if (params.sortBy === 'difference') {
      if (params.type === 'my') {
        sortObj = {
          difference: params.sortOrder * -1,
        };
      } else {
        sortObj = {
          difference: params.sortOrder,
        };
      }
    }
    if (params.sortBy === 'price') {
      if (params.type === 'my') {
        sortObj = {
          hisAllSkinsPrice: params.sortOrder,
        };
      } else {
        sortObj = {
          myAllSkinsPrice: params.sortOrder,
        };
      }
    }

    let trades = [];

    if (params.type === 'recommended') {
      const findRecommendedObj = TradesController.generateAllTradesParams(user, recommendationParams, ItemsNames, recommendedItemsNames);
      trades = await Trade.find(findRecommendedObj)
        .populate('user1 user2')
        .sort(sortObj)
        .skip(params.offset || 0)
        .limit(params.limit || 10)
        .lean()
        .exec();
    } else {
      trades = await Trade.find(findObj)
        .populate('user1 user2')
        .sort(sortObj)
        .skip(params.offset || 0)
        .limit(params.limit || 10)
        .lean()
        .exec();
    }

    if (!trades) {
      return [];
    }

    const itemsWithAssetId = await UserController.getUserItemsForAutoTrade(user);
    return TradesController.processTradesListV2(trades, user, itemsWithAssetId);
  }

  static processTradesList(trades, user, itemsWithAssetId) {
    return trades.map(trade => {
      const user1 = trade.user1;

      if (!user1) {
        // trade.remove();
        logger.error(`trade dont have user1 ${trade._id}`);
        return null;
      }

      let user2 = trade.user2;

      trade.items = (trade.items || []).map(item => {
        return {
          ...item,
          appid: parseInt(item.appid, 10),
          paintWear: !item.float || item.float === 'unavailable' ? null : parseFloat(item.float.substr(0, 10)),
          float: !item.float || item.float === 'unavailable' ? null : item.float.substr(0, 10),
        };
      });
      trade.itemsPartner = (trade.itemsPartner || []).map(item => {
        return {
          ...item,
          appid: parseInt(item.appid, 10),
          paintWear: !item.float || item.float === 'unavailable' ? null : parseFloat(item.float.substr(0, 10)),
          float: !item.float || item.float === 'unavailable' ? null : item.float.substr(0, 10),
        };
      });

      if (trade.autoTrade) {
        if (trade.steamId === user.steamId) {
          if (trade.status === 'new' || trade.status === 'reject') {
            user2 = {
              avatar: 'Bomb',
              avatarmedium: 'Bomb',
              personaname: 'Super-Trade',
              bans: {},
              tradeUrl: '',
              subscriber: false,
              allSkinsCount: 1,
              steamId: 'noSteamId',
            };
          } else if (trade.status === 'finished') {
            user2 = trade.user2;
          }
        } else if (trade.steamId !== user.steamId) {
          for (let i = 0; i < trade.itemsPartner.length; i++) {
            trade.itemsPartner[i].quality_name = 'unique';
            trade.itemsPartner[i].quality_type = 'Standard';
            trade.itemsPartner[i].rarity_color = (trade.itemsPartner[i].rarity_color || '').replace('#', '');
            trade.itemsPartner.forEach(item => {
              if (!item.assetid) {
                const itemWithAssetId = itemsWithAssetId.find(it => it.name === item.name && it.assetid);
                if (itemWithAssetId) {
                  item.price = itemWithAssetId.price;
                  item.assetid = itemWithAssetId.assetid;
                  if (itemWithAssetId.float === null || itemWithAssetId.float === undefined || itemWithAssetId.float === 'wait...') {
                    itemWithAssetId.float = 'unavailable';
                  }
                  item.paintWear = itemWithAssetId.float === 'unavailable' ? null : parseFloat(itemWithAssetId.float.substr(0, 10));
                }
              }
            });
          }
          trade.steamIdPartner = user.steamId;
          user2 = user;
        }
      }

      if (!user2) user2 = {};

      trade.items.sort(sortItemsByPrice);
      trade.itemsPartner.sort(sortItemsByPrice);

      const mirrorTrade = {
        _id: trade._id,
        steamId: trade.steamId,
        steamIdPartner: trade.steamIdPartner,
        autoTrade: !!trade.autoTrade,
        timeAgo: Math.floor((Date.now() - new Date(trade.createdAt).getTime()) / 1000),
        user: getShortUserInfo(user1),
        partner: getShortUserInfo(user2),
        items: trade.itemsPartner,
        itemsPartner: trade.items,
        myAllSkinsPrice: trade.myAllSkinsPrice,
        hisAllSkinsPrice: trade.hisAllSkinsPrice,
        difference: trade.hisAllSkinsPrice - trade.myAllSkinsPrice,
        surcharge: 0,
        userSurcharge: 'me',
        premium: trade.premium,
        status: trade.status,
        close: trade.close,
        userClose: trade.userClose,
        isOpened: trade.isOpened,
        steamTradeStatus: trade.steamTradeStatus,
        steamTradeID: trade.steamTradeID,
        steamTradeComment: trade.steamTradeComment,
        steamLastSendPushCheck: trade.steamLastSendPushCheck,
        steamSendPushCount: trade.steamSendPushCount,
        datecteate: trade.datecreate,
      };
      if (trade.steamId !== user.steamId) {
        mirrorTrade.user = getShortUserInfo(user2);
        mirrorTrade.partner = getShortUserInfo(user1);
        mirrorTrade.items = trade.items;
        mirrorTrade.itemsPartner = trade.itemsPartner;
        mirrorTrade.myAllSkinsPrice = trade.hisAllSkinsPrice;
        mirrorTrade.hisAllSkinsPrice = trade.myAllSkinsPrice;
        mirrorTrade.difference = trade.difference;
      }
      return mirrorTrade;
    });
  }

  static processTradesListV2(trades, user, itemsWithAssetId) {
    return trades
      .map(trade => {
        const user1 = trade.user1;

        if (!user1) {
          // trade.remove();
          logger.error(`trade dont have user1 ${trade._id}`);
          return null;
        }

        let user2 = trade.user2;

        trade.items = (trade.items || []).map(item => {
          return {
            ...item,
            appid: parseInt(item.appid, 10),
          };
        });
        trade.itemsPartner = (trade.itemsPartner || []).map(item => {
          return {
            ...item,
            appid: parseInt(item.appid, 10),
          };
        });

        if (trade.autoTrade) {
          if (trade.steamId === user.steamId) {
            if (trade.status === 'new' || trade.status === 'reject') {
              user2 = {
                avatar: 'Bomb',
                avatarmedium: 'Bomb',
                personaname: 'Super-Trade',
                bans: {},
                tradeUrl: '',
                subscriber: false,
                allSkinsCount: 1,
                steamId: 'noSteamId',
              };
            } else if (trade.status === 'finished') {
              user2 = trade.user2;
            }
          } else if (trade.steamId !== user.steamId) {
            for (let i = 0; i < trade.itemsPartner.length; i++) {
              // eslint-disable-next-line no-loop-func
              const itemWithAssetId = itemsWithAssetId.find(it => it.name === trade.itemsPartner[i].name && it.assetid);
              if (itemWithAssetId) {
                trade.itemsPartner[i] = itemWithAssetId;
                if (itemWithAssetId.float === null || itemWithAssetId.float === undefined || itemWithAssetId.float === 'wait...') {
                  itemWithAssetId.float = 'unavailable';
                }
                trade.itemsPartner[i].paintWear =
                  itemWithAssetId.float === 'unavailable' ? null : parseFloat(itemWithAssetId.float.substr(0, 10));
              }
            }
            trade.steamIdPartner = user.steamId;
            user2 = user;
          }
        }

        if (!user2) user2 = {};

        trade.items.sort(sortItemsByPrice);
        trade.itemsPartner.sort(sortItemsByPrice);

        return {
          _id: trade._id,
          money: {
            count: trade.money,
            img: '',
          },
          steamId: trade.steamId,
          steamIdPartner: trade.steamIdPartner,
          autoTrade: !!trade.autoTrade,
          timeAgo: Math.floor((Date.now() - new Date(trade.createdAt).getTime()) / 1000),
          user: getShortUserInfo(user1),
          partner: getShortUserInfo(user2),
          items: trade.items,
          itemsPartner: trade.itemsPartner,
          myAllSkinsPrice: trade.myAllSkinsPrice,
          hisAllSkinsPrice: trade.hisAllSkinsPrice,
          surcharge: 0,
          userSurcharge: 'me',
          premium: trade.premium,
          status: trade.status,
          close: trade.close,
          userClose: trade.userClose,
          isOpened: trade.isOpened,
          steamTradeStatus: trade.steamTradeStatus,
          steamTradeID: trade.steamTradeID,
          steamTradeComment: trade.steamTradeComment,
          steamLastSendPushCheck: trade.steamLastSendPushCheck,
          steamSendPushCount: trade.steamSendPushCount,
          datecteate: trade.datecreate,
          likes: trade.likes || [],
          views: trade.views || 0,
        };
      })
      .filter(trade => !!trade);
  }

  static async getAllNewTradesCount(steamId) {
    // const names = await UserController.getUserItemsNames(steamId);
    return Trade.countDocuments({
      autoTrade: {
        $ne: true,
      },
      steamIdPartner: steamId,
      status: 'new',
    });
  }

  static async getLastTrade(steamId, steamIdPartner) {
    return Trade.findOne({
      steamId,
      steamIdPartner,
    })
      .populate('user1 user2')
      .sort({
        createdAt: -1,
      })
      .lean();
  }

  static async get(tradeId, params) {
    let trade = await Trade.findOne({
      _id: tradeId,
    })
      .populate('user1 user2')
      .lean()
      .exec();

    if (!trade || !trade.user1) {
      trade = await MessageTrade.findOne({
        _id: tradeId,
      })
        .populate('user1 user2')
        .lean()
        .exec();
    }

    if (!trade || !trade.user1) {
      return {
        error: 'trade not found',
      };
    }

    if (!trade.itemsPartner) {
      trade.itemsPartner = [];
    }

    const steamId = params.steamId;
    let user2 = trade.user2 || {};
    const user1 = trade.user1 || {};
    if (trade.autoTrade) {
      if (!user2 || !user2.steamId) {
        user2 = {
          avatar: 'Bomb',
          avatarmedium: 'Bomb',
          personaname: 'Super-Trade',
          coinCount: 0,
          tradeUrl: '',
          subscriber: false,
          allSkinsCount: 1,
          steamId: 'noSteamId',
          email: 'noEmail',
        };
      }
      if (trade.steamId !== user1.steamId) {
        trade.steamIdPartner = user1.steamId;
      }
    }

    trade.items.sort(sortItemsByPrice);
    trade.itemsPartner.sort(sortItemsByPrice);

    const mirrorTrade = {
      _id: trade._id,
      steamId: trade.steamId,
      steamIdPartner: trade.steamIdPartner,
      autoTrade: !!trade.autoTrade,
      user: getShortUserInfo(user1),
      partner: getShortUserInfo(user2),
      items: trade.itemsPartner,
      itemsPartner: trade.items,
      myAllSkinsPrice: trade.myAllSkinsPrice,
      hisAllSkinsPrice: trade.hisAllSkinsPrice,
      difference: trade.difference,
      status: trade.status,
      close: trade.close,
      userClose: trade.userClose,
      premium: trade.premium,
      isOpened: trade.isOpened,
      steamTradeStatus: trade.steamTradeStatus,
      steamTradeID: trade.steamTradeID,
      steamTradeComment: trade.steamTradeComment,
      steamLastSendPushCheck: trade.steamLastSendPushCheck,
      steamSendPushCount: trade.steamSendPushCount,
      views: trade.views,
    };
    if (trade.steamId !== steamId) {
      mirrorTrade.user = getShortUserInfo(user2);
      mirrorTrade.partner = getShortUserInfo(user1);
      mirrorTrade.items = trade.items;
      mirrorTrade.itemsPartner = trade.itemsPartner;
      mirrorTrade.myAllSkinsPrice = trade.hisAllSkinsPrice;
      mirrorTrade.hisAllSkinsPrice = trade.myAllSkinsPrice;
    }
    return {
      trade: mirrorTrade,
    };
  }

  static async getV3(tradeId) {
    let trade = await Trade.findOne({
      _id: tradeId,
    })
      .populate('user1 user2')
      .lean()
      .exec();

    if (!trade || !trade.user1) {
      trade = await MessageTrade.findOne({
        _id: tradeId,
      })
        .populate('user1 user2')
        .lean()
        .exec();
    }

    if (!trade || !trade.user1) {
      return {
        error: 'trade not found',
      };
    }

    if (!trade.itemsPartner) {
      trade.itemsPartner = [];
    }

    const user1 = trade.user1 || {};
    let user2 = trade.user2 || {};
    user1.isFriend = user2.friends && user2.friends.indexOf(user1.steamId) > -1;
    user2.isFriend = user1.friends && user2 && user1.friends.indexOf(user2.steamId) > -1;
    if (trade.autoTrade) {
      if (!user2 || !user2.steamId) {
        user2 = {
          avatar: 'Bomb',
          avatarmedium: 'Bomb',
          personaname: 'Super-Trade',
          coinCount: 0,
          tradeUrl: '',
          subscriber: false,
          allSkinsCount: 1,
          steamId: 'noSteamId',
          email: 'noEmail',
        };
      }
      if (trade.steamId !== user1.steamId) {
        trade.steamIdPartner = user1.steamId;
      }
    }

    trade.items.sort(sortItemsByPrice);
    trade.itemsPartner.sort(sortItemsByPrice);

    return {
      trade: {
        _id: trade._id,
        money: trade.money,
        code: trade.code,
        timeAgo: Math.floor((Date.now() - new Date(trade.createdAt).getTime()) / 1000),
        steamId: trade.steamId,
        usersReject: trade.usersReject || [],
        steamIdPartner: trade.steamIdPartner,
        autoTrade: !!trade.autoTrade,
        user: getShortUserInfo(user1),
        partner: getShortUserInfo(user2),
        items: trade.items,
        likes: trade.likes,
        views: trade.views,
        itemsPartner: trade.itemsPartner,
        myAllSkinsPrice: trade.myAllSkinsPrice,
        hisAllSkinsPrice: trade.hisAllSkinsPrice,
        difference: trade.difference,
        status: trade.status,
        close: trade.close,
        userClose: trade.userClose,
        premium: trade.premium,
        isOpened: trade.isOpened,
        steamTradeStatus: trade.steamTradeStatus,
        steamTradeID: trade.steamTradeID,
        steamTradeComment: trade.steamTradeComment,
        steamLastSendPushCheck: trade.steamLastSendPushCheck,
        steamSendPushCount: trade.steamSendPushCount,
      },
    };
  }
};
