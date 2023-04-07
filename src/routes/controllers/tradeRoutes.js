const TradesController = require('../../controllers/TradesController');
const Comment = require('../../models/Comment');
const processItem = require('../../helpers/processItem');
const addStat = require('../../helpers/addStat');
const getUserItemsArray = require('../../helpers/getUserItemsArray');
const hasReviewed = require('../../helpers/hasReviewed');

module.exports = class TradeRoutes {
  static async tradeGetInfoForTradeWithOffset(req, res) {
    let myLimit = req.body.mylimit;
    let myOffset = req.body.myoffset;
    let hisLimit = req.body.hislimit;
    let hisOffset = req.body.hisoffset;

    if (typeof myLimit === 'string') myLimit = parseInt(myLimit, 10);
    if (typeof myOffset === 'string') myOffset = parseInt(myOffset, 10);
    if (typeof hisLimit === 'string') hisLimit = parseInt(hisLimit, 10);
    if (typeof hisOffset === 'string') hisOffset = parseInt(hisOffset, 10);

    if (myLimit > 5000) myLimit = 1000;
    if (hisLimit > 5000) hisLimit = 1000;
    if (myOffset < 0) myOffset = 0;
    if (hisOffset < 0) hisOffset = 0;

    let filters = req.body.filters || [];
    let filtersPartner = req.body.filtersPartner || [];

    if (typeof filters === 'string') {
      try {
        filters = JSON.parse(filters);
      } catch (e) {
        logger.error('getInfoForTradeWithOffset filters %j', e);
        filters = [];
      }
    }

    if (typeof filtersPartner === 'string') {
      try {
        filtersPartner = JSON.parse(filtersPartner);
      } catch (e) {
        logger.error('getInfoForTradeWithOffset filtersPartner %j', e);
        filtersPartner = [];
      }
    }

    const items = await TradesController.getAllItemsDataForTrade({
      steamId: req.user.steamId,
      user: req.user,
      partnerSteamID: req.body.partnerSteamID,
      filters,
      filtersPartner,
      myLimit,
      myOffset,
      hisLimit,
      hisOffset,
      myWishlist: false,
      hisWishlist: false,
    });

    const myItems = items.myItems;
    const hisItems = items.hisItems;

    const result = {
      status: 'success',
      myItems,
      hisItems,
      myOffset: items ? items.myOffset : 0,
      hisOffset: items ? items.hisOffset : 0,
      myAllItemsCount: items ? items.myItemsCount : 0,
      hisAllItemsCount: items ? items.hisItemsCount : 0,
    };
    if (redisClient) {
      redisClient.setex(req.redisToken, 20, JSON.stringify(result));
    }
    res.json(result);
  }

  static async tradeGetCountUsersHaveItems(req, res) {
    let itemsNames = req.body.itemsNames || [];
    if (typeof itemsNames === 'string') {
      itemsNames = [itemsNames];
    }
    if (itemsNames.length <= 0) {
      res.json({
        status: 'error',
        message: 'not correct data',
      });
      return;
    }
    const count = await TradesController.getCountItemsOnUsers(req.user, itemsNames);
    res.json({
      status: 'success',
      message: count,
    });
  }

  static async tradeReject(req) {
    if (typeof req.body.type === 'undefined') {
      req.body.type = 'steam';
    }
    await TradesController.reject({
      user: req.user,
      steamId: req.user.steamId,
      tradeId: req.body.tradeId,
      steamTradeStatus: 'rejected',
      steamTradeInfo: req.body.type,
    });
    await addStat('tradesDeclined');
    return { status: 'success' };
  }

  static async tradePushTradeStatus(req, res) {
    const { error, result } = await TradesController.pushSteamTradeStatus({
      steamId: req.user.steamId,
      tradeId: req.body.tradeId,
      steamTradeLastStatus: req.body.steamTradeLastStatus,
      steamStatus: req.body.steamStatus,
    });

    if (error) {
      res.json({
        status: 'error',
        message: error,
      });
    } else {
      res.json({
        status: 'success',
        result,
      });
    }
  }

  static async tradeGetTrades(req, res) {
    const params = { limit: parseInt(req.body.limit, 10) || 10, offset: parseInt(req.body.offset, 10) || 0 };
    if (req.body.type) params.type = req.body.type;
    if (req.body.hidden) params.hidden = req.body.hidden;
    if (req.body.sortBy) params.sortBy = req.body.sortBy;
    if (req.body.sortOrder) params.sortOrder = req.body.sortOrder;
    if (req.body.typeStatus && typeof req.body.typeStatus === 'string') {
      if (req.body.typeStatus.indexOf('[') === -1) {
        req.body.typeStatus = [req.body.typeStatus];
      } else {
        req.body.typeStatus = JSON.parse(req.body.typeStatus);
      }
    }
    if (params.limit > 50) {
      params.limit = 50;
    }
    if (req.body.typeStatus && req.body.typeStatus.length > 0) {
      params.typeStatus = req.body.typeStatus;
    }
    const results = await Promise.all([
      TradesController.getAllTrades(req.user, params),
      TradesController.getAllNewTradesCount(req.user.steamId),
    ]);

    const trades = await Promise.all(
      results[0].map(async trade => {
        if (!trade.items) trade.items = [];
        if (!trade.itemsPartner) trade.itemsPartner = [];
        trade.items = await Promise.all(trade.items.map(item => processItem(item)));
        trade.itemsPartner = await Promise.all(trade.itemsPartner.map(item => processItem(item)));
        return trade;
      }),
    );

    // if (redisClient) {
    //   redisClient.setex(
    //     req.redisToken,
    //     30,
    //     JSON.stringify({
    //       status: 'success',
    //       trades,
    //       newCount: results[1],
    //     }),
    //   );
    // }
    res.json({
      status: 'success',
      trades,
      newCount: results[1],
    });
  }

  static async tradeGetTradesV3(req, res) {
    // eslint-disable-next-line no-undef
    // if (redisClient && redisGet) {
    //   // eslint-disable-next-line no-undef
    //   const result = await redisGet(req.redisToken);
    //   if (result) {
    //     res.json(result);
    //     return;
    //   }
    // }
    const params = {
      filters: {},
      limit: parseInt(req.body.limit, 10) || 10,
      offset: parseInt(req.body.offset, 10) || 0,
    };
    if (req.body.type) params.type = req.body.type;
    if (req.body.hidden) params.hidden = req.body.hidden;
    if (req.body.sortBy) params.sortBy = req.body.sortBy;
    if (req.body.sortOrder) params.sortOrder = req.body.sortOrder;
    if (req.body.filters) params.filters = req.body.filters;
    if (params.limit > 50) {
      params.limit = 50;
    }
    let trades = await TradesController.getAllTradesV2(req.user, params);
    const tradesNewCount = await TradesController.getAllNewTradesCount(req.user.steamId);

    trades = await Promise.all(
      trades.map(async trade => {
        if (!trade.items) trade.items = [];
        if (!trade.itemsPartner) trade.itemsPartner = [];
        trade.items = await Promise.all(trade.items.map(item => processItem(item)));
        trade.itemsPartner = await Promise.all(trade.itemsPartner.map(item => processItem(item)));
        trade.didILikeThis = !!(trade.likes || []).find(like => like === req.user.steamId);
        trade.likes = (trade.likes || []).length;
        trade.views = trade.views || 0;
        return trade;
      }),
    );
    const allComments = await Comment.find({
      entityType: 'trade',
      entityId: { $in: trades.map(tr => tr._id.toString()) },
    }).populate('user');
    trades.map(trade => {
      trade.items = trade.items.map(it => {
        it.contextid = `${it.contextid}`;
        return it;
      });
      trade.itemsPartner = trade.itemsPartner.map(it => {
        it.contextid = `${it.contextid}`;
        return it;
      });
      trade.comments = allComments
        .filter(com => com.entityId === trade._id.toString())
        .map(com => {
          return {
            _id: com._id,
            date: com.createdAt,
            comment: com.comment,
            steamId: com.steamId,
            personaname: com.user.personaname,
            avatar: com.user.avatarfull,
            subscriber: com.user.subscriber,
          };
        });
      return trade;
    });

    if (redisClient) {
      redisClient.setex(
        req.redisToken,
        30,
        JSON.stringify({
          status: 'success',
          result: {
            trades,
            newCount: tradesNewCount,
          },
        }),
      );
    }
    res.json({
      status: 'success',
      result: {
        trades,
        newCount: tradesNewCount,
      },
    });
  }

  static async tradeGetTrade(req, res) {
    const params = { steamId: req.user.steamId };
    if (typeof req.body.andHisItems !== 'undefined') {
      params.andHisItems = req.body.andHisItems;
    }
    const { error, trade } = await TradesController.get(req.body.tradeId, params);
    if (error) {
      res.json({
        status: 'error',
        message: error,
      });
      return;
    }

    if (!trade.items) trade.items = [];
    if (!trade.itemsPartner) trade.itemsPartner = [];
    trade.items = await Promise.all(trade.items.map(item => processItem(item)));
    trade.itemsPartner = await Promise.all(trade.itemsPartner.map(item => processItem(item)));

    trade.didILikeThis = !!(trade.likes || []).find(like => like === req.user.steamId);
    trade.likes = (trade.likes || []).length;

    trade.comments = await Comment.find({ entityType: 'trade', entityId: trade._id.toString() }).populate('user');
    trade.comments = trade.comments.map(com => {
      return {
        _id: com._id,
        date: com.createdAt,
        comment: com.comment,
        steamId: com.steamId,
        personaname: com.user.personaname,
        avatar: com.user.avatarfull,
        subscriber: com.user.subscriber,
      };
    });

    res.json({
      status: 'success',
      trade,
    });
  }

  static async tradeGetTradeV3(req, res) {
    const { error, trade } = await TradesController.getV3(req.params.tradeId);
    if (error) {
      res.json({
        status: 'error',
        code: 0,
        message: error,
      });
      return;
    }
    if (!trade.items) trade.items = [];
    if (!trade.itemsPartner) trade.itemsPartner = [];

    trade.acceptable = false;

    if (trade.autoTrade && trade.status === 'new') {
      if (!trade.usersReject) {
        trade.usersReject = [];
      }
      if (trade.usersReject.indexOf(req.user.steamId) > -1) {
        trade.status = 'reject';
      } else {
        const items = await getUserItemsArray(req.user.steamId);
        if (trade.partner.steamId === 'noSteamId' && trade.itemsPartner[0]) {
          trade.acceptable = false;
          const item = items.find(it => it.name === trade.itemsPartner[0].name && it.assetid && it.tradable);
          if (item) {
            trade.itemsPartner[0] = item;
            trade.acceptable = !!item.tradable;
          }
        }
      }
    }
    if (!trade.autoTrade && trade.status === 'new') {
      trade.acceptable = trade.steamIdPartner === req.user.steamId;
    }
    trade.money = {
      count: trade.money,
      img: '',
    };

    if (trade.partner.reviews) {
      trade.partner.reviews = {
        avg: trade.partner.reviews.avg,
        count: trade.partner.reviews.count,
      };
    }
    trade.partner.reviews.hasReviewed = await hasReviewed(trade.partner.steamId, trade.user.steamId);

    if (!trade.user.reviews) {
      trade.user.reviews = {
        avg: trade.user.reviews.avg,
        count: trade.partner.reviews.count,
      };
    }
    trade.user.reviews.hasReviewed = await hasReviewed(trade.user.steamId, trade.partner.steamId);

    trade.items = await Promise.all(trade.items.map(item => processItem(item)));
    trade.itemsPartner = await Promise.all(trade.itemsPartner.map(item => processItem(item)));

    trade.didILikeThis = !!(trade.likes || []).find(like => like === req.user.steamId);
    trade.likes = (trade.likes || []).length;
    trade.views = trade.views || 0;
    trade.comments = await Comment.find({ entityType: 'trade', entityId: trade._id.toString() }).populate('user');
    trade.comments = trade.comments.map(com => {
      return {
        _id: com._id,
        date: com.createdAt,
        comment: com.comment,
        steamId: com.steamId,
        personaname: com.user.personaname,
        avatar: com.user.avatarfull,
        subscriber: com.user.subscriber,
      };
    });

    res.json({
      status: 'success',
      result: {
        trade,
      },
    });
  }
};
