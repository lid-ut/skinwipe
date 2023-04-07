const Joi = require('joi');
const expressJoi = require('express-joi-validator');

const TradeRoutes = require('./controllers/tradeRoutes');
const middlewares = require('./middlewares');

const upTrade = require('./trade/upTrade');
const steamError = require('./trade/steamError');
const getSentTrades = require('./trade/getSentTrades');
const getReceivedTrades = require('./trade/getReceivedTrades');
const acceptTrade = require('./trade/accept');
const acceptCheckTrade = require('./trade/acceptCheck');
const makePremium = require('./trade/makePremium');
const upAllSuperTradesPrice = require('./trade/upAllSuperTradesPrice');
const upAllSuperTrades = require('./trade/upAllSuperTrades');
const declineAll = require('./trade/declineAll');
const create = require('./trade/create');
const chatTrades = require('../modules/chattrades');

/*
 * @api [post] /api/trade/getInfoForTradeWithOffset
 * description: "Получение инормации о скинах для трейда"
 * deprecated: true
 * tags:
 * - deprecated
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/trade/getInfoForTradeWithOffset',
  expressJoi({
    body: {
      myoffset: Joi.number().min(0).max(5000).required(),
      mylimit: Joi.number().min(0).max(100).required(),
      hisoffset: Joi.number().min(0).max(5000).required(),
      hislimit: Joi.number().min(0).max(100).required(),
      filters: Joi.any(),
      filtersPartner: Joi.any(),
      partnerSteamID: Joi.string().min(1).max(50).required(),
    },
  }),
  middlewares.checkXAT,
  TradeRoutes.tradeGetInfoForTradeWithOffset,
);

/*
 * @api [post] /api/trade/getCountUsersHaveItems
 * description: "Сколько юзеров имеют конкретный скин"
 * tags:
 * - refactoring
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/trade/getCountUsersHaveItems',
  expressJoi({
    body: {
      itemsNames: Joi.any(),
    },
  }),
  middlewares.checkXAT,
  TradeRoutes.tradeGetCountUsersHaveItems,
);

/*
 * @api [post] /api/trade/accept
 * description: "Принятие трейда, супер трейда, ставки. Проверяет скины из трейда"
 * tags:
 * - refactoring
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/trade/accept',
  expressJoi({
    body: {
      tradeId: Joi.string().min(1).max(50).required(),
      steamTradeStatus: Joi.string().min(1).max(50).required(),
      steamTradeID: Joi.string().min(1).max(50).required(),
      steamIdPartner: Joi.any(),
    },
  }),
  middlewares.checkXAT,
  acceptTrade,
);

/*
 * @api [post] /api/trade/accept/check
 * description: "Проверка возможности принятия трейда"
 * tags:
 * - refactoring
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/trade/accept/check',
  expressJoi({
    body: {
      tradeId: Joi.string().min(1).max(50).required(),
    },
  }),
  middlewares.checkXAT,
  acceptCheckTrade,
);

/*
 * @api [post] /api/trade/reject
 * description: "Отклоняет тред, супер трейд, ставку"
 * tags:
 * - refactoring
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/trade/reject',
  expressJoi({
    body: {
      type: Joi.string().min(1).max(50),
      tradeId: Joi.string().min(1).max(50).required(),
    },
  }),
  middlewares.checkXAT,
  TradeRoutes.tradeReject,
);

/*
 * @api [post] /api/trade/status/push
 * description: "Изменяет steam статус трейда, каждый пуш статуса сопровождается проверкой в steam на клиенте"
 * tags:
 * - refactoring
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/trade/status/push',
  expressJoi({
    body: {
      steamTradeLastStatus: Joi.string().allow('').min(0).max(50),
      tradeId: Joi.string().min(1).max(50).required(),
      steamStatus: Joi.string().allow('').min(0).max(50),
    },
  }),
  middlewares.checkXAT,
  TradeRoutes.tradePushTradeStatus,
);

/*
 * @api [post] /api/trade/steam/error
 * description: "Изменяет steam статус трейда, каждый пуш статуса сопровождается проверкой в steam на клиенте"
 * tags:
 * - refactoring
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/trade/steam/error',
  expressJoi({
    body: {
      tradeId: Joi.string(),
      betId: Joi.string(),
      steamError: Joi.string(),
    },
  }),
  middlewares.checkXAT,
  steamError,
);

/*
 * @api [get] /api/trade/steam/sent/list
 * description: "Получения трейдов для принятия"
 * tags:
 * - trade
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/trade/steam/sent/list', middlewares.checkXAT, getSentTrades);

/*
 * @api [get] /api/trade/steam/received/list
 * description: "Получения трейдов для подтверждения"
 * tags:
 * - trade
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/trade/steam/received/list', middlewares.checkXAT, getReceivedTrades);

/*
 * @api [post] /api/trade/v2/getTrade
 * description: "Получение одного трейда. Используеться при открытии пуша о новом трейде"
 * deprecated: true
 * tags:
 * - deprecated
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/trade/v2/getTrade',
  expressJoi({
    body: {
      andHisItems: Joi.any(),
      tradeId: Joi.string().min(1).max(50).required(),
    },
  }),
  middlewares.checkXAT,
  TradeRoutes.tradeGetTrade,
);

/*
 * @api [get] /api/trade/{tradeId}
 * description: "Получение одного трейда. Используеться при открытии пуша о новом трейде (без зеркалирования)"
 * tags:
 * - trade
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: path
 *   name: tradeId
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get(
  '/api/trade/:tradeId',
  expressJoi({
    params: {
      tradeId: Joi.string().min(8).max(100).required(),
    },
  }),
  middlewares.checkXAT,
  TradeRoutes.tradeGetTradeV3,
);

/*
 * @api [post] /api/trade/v2/getTrades
 * description: "Новый метов получения трейдов с пагинацией и статусами."
 * deprecated: true
 * tags:
 * - trade
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: body
 *   name: body
 *   description: Request body.
 *   schema:
 *     type: object
 *     properties:
 *       type:
 *         type: string
 *       hidden:
 *         type: boolean
 *       typeStatus:
 *         type: string
 *       offset:
 *         type: number
 *       limit:
 *         type: number
 *       sortBy:
 *         type: string
 *       sortOrder:
 *         type: number
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/trade/v2/getTrades',
  expressJoi({
    body: {
      type: Joi.string().min(1).max(50),
      hidden: Joi.boolean(),
      typeStatus: Joi.any(),
      offset: Joi.number().min(0).max(1000),
      limit: Joi.number().min(1).max(1000),
      sortBy: Joi.string(),
      sortOrder: Joi.number().min(-1).max(1),
    },
  }),
  middlewares.checkXAT,
  TradeRoutes.tradeGetTrades,
);

/*
 * @api [post] /api/trade/v3/getTrades
 * description: "Новый метов получения трейдов с пагинацией и статусами (без зеркалирования)"
 * tags:
 * - trade
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: body
 *   name: body
 *   description: Request body.
 *   schema:
 *     type: object
 *     properties:
 *       offset:
 *         type: number
 *       limit:
 *         type: number
 *       sortBy:
 *         type: string
 *       sortOrder:
 *         type: number
 *       filters:
 *         type: object
 *         properties:
 *           price:
 *             type: object
 *             properties:
 *               min:
 *                 type: number
 *               max:
 *                 type: number
 *           name:
 *             type: string
 *             minLength: 2
 *             maxLength: 80
 *           csgo:
 *             type: object
 *             properties:
 *               type:
 *                 type: array
 *                 default: false
 *                 items:
 *                   type: string
 *               quality:
 *                 type: array
 *                 default: false
 *                 items:
 *                   type: string
 *               float:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: number
 *                     default: 0
 *                   to:
 *                     type: number
 *                     default: 100
 *               statTrack:
 *                 type: boolean
 *                 default: false
 *               weapon:
 *                 type: array
 *                 default: ["tec-9"]
 *                 items:
 *                   type: string
 *               exterior:
 *                 type: array
 *                 default: ["minimal wear"]
 *                 items:
 *                   type: string
 *               stickerCount:
 *                 type: number
 *               stickerNames:
 *                 type: array
 *                 default: false
 *                 items:
 *                   type: string
 *               paintSeed:
 *                 type: array
 *                 default: false
 *                 items:
 *                   type: string
 *           dota2:
 *             type: object
 *             properties:
 *               type:
 *                 type: array
 *                 items:
 *                   type: string
 *               quality:
 *                 type: array
 *                 items:
 *                   type: string
 *               rarity:
 *                 type: array
 *                 items:
 *                   type: string
 *               hero:
 *                 type: array
 *                 items:
 *                   type: string
 *               slot:
 *                 type: array
 *                 items:
 *                   type: string
 *               runeNames:
 *                 type: array
 *                 items:
 *                   type: string
 *           tf2:
 *             type: object
 *             properties:
 *               class:
 *                 type: array
 *                 items:
 *                   type: string
 *               quality:
 *                 type: array
 *                 items:
 *                   type: string
 *               type:
 *                 type: array
 *                 items:
 *                   type: string
 *               weapon:
 *                 type: array
 *                 items:
 *                   type: string
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/trade/v3/getTrades',
  expressJoi({
    body: {
      type: Joi.string().min(1).max(50),
      hidden: Joi.boolean(),
      typeStatus: Joi.any(),
      offset: Joi.number().min(0).max(5000),
      limit: Joi.number().min(1).max(400),
      sortBy: Joi.string(),
      sortOrder: Joi.number().min(-1).max(1),
      filters: {
        price: {
          min: Joi.number(),
          max: Joi.number(),
        },
        name: Joi.string().min(2).max(80),
        csgo: {
          float: {
            from: Joi.number(),
            to: Joi.number(),
          },
          quality: Joi.array(),
          type: Joi.array(),
          stickerCount: Joi.number(),
          stickerNames: Joi.array(),
          paintSeed: Joi.array(),
          statTrack: Joi.boolean(),
          weapon: Joi.array(),
          exterior: Joi.array(),
        },
        dota2: {
          type: Joi.array(),
          quality: Joi.array(),
          rarity: Joi.array(),
          hero: Joi.array(),
          slot: Joi.array(),
          runeNames: Joi.array(),
        },
        tf2: {
          class: Joi.array(),
          quality: Joi.array(),
          weapon: Joi.array(),
          type: Joi.array(),
        },
      },
    },
  }),
  middlewares.checkXAT,
  TradeRoutes.tradeGetTradesV3,
);
/*
 * @api [post] /api/chat/trades/
 * description: "Новый метов получения трейдов с пагинацией и статусами (без зеркалирования)"
 * tags:
 * - trade
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: body
 *   name: body
 *   description: Request body.
 *   schema:
 *     type: object
 *     properties:
 *       offset:
 *         type: number
 *       limit:
 *         type: number
 *       sortBy:
 *         type: string
 *       sortOrder:
 *         type: number
 *       filters:
 *         type: object
 *         properties:
 *           price:
 *             type: object
 *             properties:
 *               min:
 *                 type: number
 *               max:
 *                 type: number
 *           name:
 *             type: string
 *             minLength: 2
 *             maxLength: 80
 *           csgo:
 *             type: object
 *             properties:
 *               type:
 *                 type: array
 *                 default: false
 *                 items:
 *                   type: string
 *               quality:
 *                 type: array
 *                 default: false
 *                 items:
 *                   type: string
 *               float:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: number
 *                     default: 0
 *                   to:
 *                     type: number
 *                     default: 100
 *               statTrack:
 *                 type: boolean
 *                 default: false
 *               weapon:
 *                 type: array
 *                 default: ["tec-9"]
 *                 items:
 *                   type: string
 *               exterior:
 *                 type: array
 *                 default: ["minimal wear"]
 *                 items:
 *                   type: string
 *               stickerCount:
 *                 type: number
 *               stickerNames:
 *                 type: array
 *                 default: false
 *                 items:
 *                   type: string
 *               paintSeed:
 *                 type: array
 *                 default: false
 *                 items:
 *                   type: string
 *           dota2:
 *             type: object
 *             properties:
 *               type:
 *                 type: array
 *                 items:
 *                   type: string
 *               quality:
 *                 type: array
 *                 items:
 *                   type: string
 *               rarity:
 *                 type: array
 *                 items:
 *                   type: string
 *               hero:
 *                 type: array
 *                 items:
 *                   type: string
 *               slot:
 *                 type: array
 *                 items:
 *                   type: string
 *               runeNames:
 *                 type: array
 *                 items:
 *                   type: string
 *           tf2:
 *             type: object
 *             properties:
 *               class:
 *                 type: array
 *                 items:
 *                   type: string
 *               quality:
 *                 type: array
 *                 items:
 *                   type: string
 *               type:
 *                 type: array
 *                 items:
 *                   type: string
 *               weapon:
 *                 type: array
 *                 items:
 *                   type: string
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/chat/trades',
  expressJoi({
    body: {
      type: Joi.string().min(1).max(50),
      offset: Joi.number().min(0).max(5000),
      limit: Joi.number().min(1).max(400),
      sortBy: Joi.string(),
      sortOrder: Joi.number().min(-1).max(1),
      filters: {
        price: {
          min: Joi.number(),
          max: Joi.number(),
        },
        name: Joi.string().min(2).max(80),
        csgo: {
          float: {
            from: Joi.number(),
            to: Joi.number(),
          },
          quality: Joi.array(),
          type: Joi.array(),
          stickerCount: Joi.number(),
          stickerNames: Joi.array(),
          paintSeed: Joi.array(),
          statTrack: Joi.boolean(),
          weapon: Joi.array(),
          exterior: Joi.array(),
        },
        dota2: {
          type: Joi.array(),
          quality: Joi.array(),
          rarity: Joi.array(),
          hero: Joi.array(),
          slot: Joi.array(),
          runeNames: Joi.array(),
        },
        tf2: {
          class: Joi.array(),
          quality: Joi.array(),
          weapon: Joi.array(),
          type: Joi.array(),
        },
      },
    },
  }),
  middlewares.checkXAT,
  chatTrades,
);

// app.post(
//   '/api/trade/:tradeId/increment_views',
//   expressJoi({
//     params: {
//       tradeId: Joi.string().min(8).max(100).required(),
//     },
//   }),
//   middlewares.checkXAT,
//   incrementViews,
// );

/*
 * @api [post] /api/trades/declineAll
 * description: "Отклонение всех трейдов"
 * tags:
 * - trade
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post('/api/trades/declineAll', expressJoi({}), middlewares.checkXAT, declineAll);

/*
 * @api [post] /api/trade/{tradeId}/premium
 * description: "Выделение трейда"
 * tags:
 * - trade
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: path
 *   name: tradeId
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/trade/:tradeId/premium',
  expressJoi({
    params: {
      tradeId: Joi.string().required(),
    },
  }),
  middlewares.checkXAT,
  makePremium,
);

/*
 * @api [get] /api/trade/upAllSuperTradesPrice
 * description: "Получение цены поднятия всех супертрейдов (своих, открытых)"
 * tags:
 * - trade
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/trade/upAllSuperTradesPrice', middlewares.checkXAT, upAllSuperTradesPrice);

/*
 * @api [post] /api/trade/upAllSuperTrades
 * description: "Поднятие всех супертрейдов (своих, открытых)"
 * tags:
 * - trade
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post('/api/trade/upAllSuperTrades', middlewares.checkXAT, upAllSuperTrades);

/*
 * @api [post] /api/trade/v2/getInfoForTradeWithOffset
 * description: "Получение инормации о скинах для трейда"
 * deprecated: true
 * tags:
 * - deprecated
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/trade/v2/getInfoForTradeWithOffset',
  expressJoi({
    body: {
      myoffset: Joi.number().min(0).max(5000).required(),
      mylimit: Joi.number().min(0).max(1000).required(),
      hisoffset: Joi.number().min(0).max(5000).required(),
      hislimit: Joi.number().min(0).max(1000).required(),
      filters: Joi.any(),
      filtersPartner: Joi.any(),
      partnerSteamID: Joi.string().min(1).max(50).required(),
    },
  }),
  middlewares.checkXAT,
  TradeRoutes.tradeGetInfoForTradeWithOffset,
);

/*
 * @api [post] /api/trade/v2/createTrade
 * description: "Создание трейда, супер трейда, ставки на аукцион"
 * tags:
 * - trade
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: body
 *   name: body
 *   description: Request body.
 *   schema:
 *     type: object
 *     properties:
 *       auctionId:
 *         type: string
 *       autoTrade:
 *         type: boolean
 *       myItemsAssetIds:
 *         type: array
 *         items:
 *           type: string
 *       hisItemsAssetIds:
 *         type: array
 *         items:
 *           type: string
 *       hisItemsNames:
 *         type: array
 *         items:
 *           type: string
 *       partnerSteamID:
 *         type: string
 *       premium:
 *         type: boolean
 *     required:
 *       - partnerSteamID
 *       - myItemsAssetIds
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/trade/v2/createTrade',
  expressJoi({
    body: {
      money: Joi.any(),
      userSurcharge: Joi.any(),
      editedTradeId: Joi.any(),
      auctionId: Joi.string().min(1).max(50),
      autoTrade: Joi.any(),
      myItemsAssetIds: Joi.any(),
      hisItemsAssetIds: Joi.any(),
      hisItemsNames: Joi.any(),
      partnerSteamID: Joi.string().min(1).max(50).required(),
      premium: Joi.boolean(),
      osType: Joi.string(),
    },
  }),
  middlewares.checkXAT,
  create,
);

/*
 * @api [post] /api/trade/{tradeId}/up
 * description: "Поднятие трейда"
 * tags:
 * - trade
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: path
 *   name: tradeId
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/trade/:tradeId/up',
  expressJoi({
    params: {
      tradeId: Joi.string().min(8).max(100).required(),
    },
  }),
  middlewares.checkXAT,
  upTrade,
);
