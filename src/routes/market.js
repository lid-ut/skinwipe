const Joi = require('joi');
const expressJoi = require('express-joi-validator');
const middlewares = require('./middlewares');
const deleteSellItem = require('./market/deleteSellItem');
const deleteSellItems = require('./market/deleteSellItems');
const sellItems = require('./market/sellItems');
const getMarketUserInventory = require('./market/getMarketUserInventory');
const getUserItemsOnSale = require('./market/getUserItemsOnSale');
const getUserItemsOnSaleSum = require('./market/getUserItemsOnSaleSum');
const getMarketItems = require('./market/getMarketItems');
const getUsersItems = require('./market/getUsersItems');
const getMarketItem = require('./market/getMarketItem');
const getMarketItemSellHistory = require('./market/getMarketItemSellHistory');
const buyItems = require('./market/buyItems');
const sentItems = require('./market/sentItems');
const tradeStatus = require('./market/trade/tradeStatus');
const tradeGet = require('./market/trade/get');
const tradesActive = require('./market/trades/active');
const tradesCurrent = require('./market/trades/current');
const tradesHistory = require('./market/trades/history');
const tradesHistoryDirection = require('./market/trades/historyDirection');
const getMarketUserVirtualInventory = require('./market/getMarketUserVirtualInventory');
const tradesCounter = require('./market/trades/counter');
const transactionsList = require('./market/transactions/list');
const transactionGet = require('./market/transactions/get');
const setAuthData = require('./steam/setAuthData');

/*
 * @api [post] /api/market/user/inventory/{offset}/{limit}
 * description: "Получение списка предметов текущего пользователя для маркета"
 * tags:
 * - market
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
 *   name: offset
 *   type: string
 *   required: true
 *   default: '0'
 * - in: path
 *   name: limit
 *   type: string
 *   required: true
 *   default: '20'
 * - in: body
 *   name: body
 *   description: Request body.
 *   schema:
 *     type: object
 *     properties:
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
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/market/user/inventory/:offset/:limit',
  expressJoi({
    body: {
      filters: Joi.any().required(),
      web: Joi.boolean(),
      cacheOnly: Joi.boolean(),
    },
  }),
  middlewares.checkXAT,
  getMarketUserInventory,
);

/*
 * @api [post] /api/market/user/inventory/{page}
 * description: "Получение списка предметов текущего пользователя для маркета"
 * tags:
 * - market
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
 *   name: offset
 *   type: string
 *   required: true
 *   default: '0'
 * - in: path
 *   name: limit
 *   type: string
 *   required: true
 *   default: '20'
 * - in: body
 *   name: body
 *   description: Request body.
 *   schema:
 *     type: object
 *     properties:
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
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/market/user/inventory/:page',
  expressJoi({
    body: {
      filters: Joi.any().required(),
    },
  }),
  middlewares.checkXAT,
  getMarketUserInventory,
);

/*
 * @api [post] /api/market/user/inventory/onsale/{page}
 * description: "Получение списка предметов на продаже текущего пользователя для маркета"
 * tags:
 * - market
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
 *   name: offset
 *   type: string
 *   required: true
 *   default: '0'
 * - in: path
 *   name: limit
 *   type: string
 *   required: true
 *   default: '20'
 * - in: body
 *   name: body
 *   description: Request body.
 *   schema:
 *     type: object
 *     properties:
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/market/user/inventory/onsale/:page',
  expressJoi({
    body: {
      filters: Joi.any().required(),
    },
  }),
  middlewares.checkXAT,
  getUserItemsOnSale,
);

/*
 * @api [post] /api/market/user/inventory/onsale/{page}
 * description: "Получение списка предметов на продаже текущего пользователя для маркета"
 * tags:
 * - market
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
 *   name: offset
 *   type: string
 *   required: true
 *   default: '0'
 * - in: path
 *   name: limit
 *   type: string
 *   required: true
 *   default: '20'
 * - in: body
 *   name: body
 *   description: Request body.
 *   schema:
 *     type: object
 *     properties:
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/market/user/inventory/onsale/sum', middlewares.checkXAT, getUserItemsOnSaleSum);

/*
 * @api [post] /api/market/user/virtual/inventory/{offset}/{limit}
 * description: ""
 * tags:
 * - market
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
 *   name: offset
 *   type: string
 *   required: true
 *   default: '0'
 * - in: path
 *   name: limit
 *   type: string
 *   required: true
 *   default: '20'
 * - in: body
 *   name: body
 *   description: Request body.
 *   schema:
 *     type: object
 *     properties:
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
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/market/user/virtual/inventory/:offset/:limit',
  expressJoi({
    body: {
      filters: Joi.any(),
    },
  }),
  middlewares.checkXAT,
  getMarketUserVirtualInventory,
);

/*
 * @api [post] /api/market/sell
 * description: "p2p продажа предметов пользователя в маркете"
 * tags:
 * - market
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
  '/api/market/sell',
  expressJoi({
    body: {
      items: Joi.any(),
      type: Joi.string(),
    },
  }),
  middlewares.checkXAT,
  sellItems,
);

/*
 * @api [post] /api/market/sell/delete
 * description: "p2p удаление предмета с продажи"
 * tags:
 * - market
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
  '/api/market/sell/delete',
  expressJoi({
    body: {
      assetid: Joi.string(),
      appid: Joi.string(),
    },
  }),
  middlewares.checkXAT,
  deleteSellItem,
);

/*
 * @api [post] /api/market/sell/delete/many
 * description: "p2p удаление предметов с продажи"
 * tags:
 * - market
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
  '/api/market/sell/delete/many',
  expressJoi({
    body: {
      assetids: Joi.any(),
      appid: Joi.string(),
    },
  }),
  middlewares.checkXAT,
  deleteSellItems,
);

/*
 * @api [post] /api/market/items/{page}
 * description: "Получение списка предметов маркета"
 * tags:
 * - market
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
  '/api/market/items/:page',
  expressJoi({
    body: {
      filters: Joi.any().required(),
      sort: Joi.string(),
      web: Joi.boolean(),
    },
  }),
  middlewares.checkXAT,
  getMarketItems,
);

/*
 * @api [post] /api/market/web/items/{page}
 * description: "Получение списка предметов маркета для неавторизованных"
 * tags:
 * - market
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
  '/api/market/web/items/:page',
  expressJoi({
    body: {
      filters: Joi.any().required(),
      sort: Joi.string(),
      web: Joi.boolean(),
    },
  }),
  middlewares.checkXATOptional,
  getMarketItems,
);

/*
 * @api [post] /api/market/users/items/{page}
 * description: "Получение списка всех предметов всех пользователей маркета"
 * tags:
 * - market
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
  '/api/market/users/items/:page',
  expressJoi({
    body: {
      filters: Joi.any().required(),
      sort: Joi.string(),
    },
  }),
  middlewares.checkXAT,
  getUsersItems,
);

/*
 * @api [post] /api/market/skin/{assetid}
 * description: "Получение скина по шарингу"
 * tags:
 * - market
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
app.get('/api/market/skin/:assetid', middlewares.checkXAT, getMarketItem);

/*
 * @api [get] /api/market/skin/sellHistory/{name}
 * description: "Получение истории продаж для скина"
 * tags:
 * - market
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
app.get('/api/market/skin/sellHistory/:name', getMarketItemSellHistory);

/*
 * @api [post] /api/market/buy
 * description: "покупка скинов в маркете"
 * tags:
 * - market
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
  '/api/market/buy',
  expressJoi({
    body: {
      items: Joi.any(),
      web: Joi.any(),
    },
  }),
  middlewares.checkXAT,
  buyItems,
);

/*
 * @api [get] /api/market/steam/auth/set
 * description: "Установка авторизационных данных стима"
 * deprecated: true
 * tags:
 * - profile
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
  '/api/market/steam/auth/set',
  expressJoi({
    body: {
      sessionid: Joi.string(),
      steamMachineAuth: Joi.string(),
      steamLoginSecure: Joi.string(),
    },
  }),
  middlewares.checkXAT,
  setAuthData,
);

/*
 * @api [post] /api/market/sent
 * description: "Отправка виртуальных скинов бота в маркете"
 * tags:
 * - market
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
  '/api/market/sent',
  expressJoi({
    body: {
      items: Joi.any(),
    },
  }),
  middlewares.checkXAT,
  sentItems,
);

/*
 * @api [post] /api/market/trade/status
 * description: "Сообщение об отправке трейдов"
 * tags:
 * - market
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
  '/api/market/trade/status',
  expressJoi({
    body: {
      tradeId: Joi.any(),
      info: Joi.any(),
      web: Joi.boolean(),
    },
  }),
  middlewares.checkXAT,
  tradeStatus,
);

/*
 * @api [post] /api/market/trades/active
 * description: "Получение трейдов активных в течении 20 минут"
 * tags:
 * - market
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
  '/api/market/trades/active',
  expressJoi({
    body: {
      type: Joi.string(),
    },
  }),
  middlewares.checkXAT,
  tradesActive,
);

/*
 * @api [post] /api/market/trades/wait
 * description: "Получение всех трейдов ожидающих отправки"
 * tags:
 * - market
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
app.get('/api/market/trades/current', middlewares.checkXAT, tradesCurrent);

/*
 * @api [post] /api/market/trades/history
 * description: "Получение страницы трейдов с фильтрами (30 шт)"
 * tags:
 * - market
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: query
 *   name: body
 *   description: Request query.
 *   schema:
 *     type: object
 *     properties:
 *       page:
 *         type: number
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/market/trades/history/:direction/:page', middlewares.checkXAT, tradesHistoryDirection);

/*
 * @api [get] /api/market/trades/counter
 * description: "Получение счетчика новый терйдов на продажу"
 * tags:
 * - market
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
app.get('/api/market/trades/counter', middlewares.checkXAT, tradesCounter);

/*
 * @api [post] /api/market/trades/history
 * description: "Получение получение страницы трейдов (30 шт)"
 * tags:
 * - market
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 * - in: query
 *   name: body
 *   description: Request query.
 *   schema:
 *     type: object
 *     properties:
 *       page:
 *         type: number
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/market/trades/history',
  expressJoi({
    body: {
      page: Joi.number(),
    },
  }),
  middlewares.checkXAT,
  tradesHistory,
);

/*
 * @api [get] /api/market/trade/get/{marketTradeId}
 * description: "Сообщение об отправке трейдов"
 * tags:
 * - market
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
app.get('/api/market/trade/get/:marketTradeId', middlewares.checkXAT, tradeGet);

/*
 * @api [post] /api/market/transactions
 * description: "Получение информации о транзакциях "
 * tags:
 * - market
 * consumes:
 * - application/json
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
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
app.post('/api/market/transactions/:page', middlewares.checkXAT, transactionsList);

/*
 * @api [get] /api/market/transaction/{id}
 * description: "Получение информации о транзакциях "
 * tags:
 * - market
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
app.get('/api/market/transaction/:id', middlewares.checkXAT, transactionGet);
