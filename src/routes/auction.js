const Joi = require('joi');
const expressJoi = require('express-joi-validator');

const middlewares = require('./middlewares');
const AuctionRoutes = require('./controllers/auctionRoutes');

const upAuction = require('./auction/upAuction');
const upV2 = require('./auction/upV2');
const reopen = require('./auction/reopen');
const createAuction = require('./auction/create');
const makePremium = require('./auction/makePremium');
const getList = require('./auction/getList');
const getListV3 = require('./auction/getListV3');
const getListAnonymous = require('./auction/getListAnonymous');
const deleteBet = require('./auction/deleteBet');
const deleteBetV2 = require('./auction/deleteBetV2');
const close = require('./auction/close');
const closeV2 = require('./auction/closeV2');
const getOne = require('./auction/getOne');
const upAllPrice = require('./auction/upAllPrice');
const upAll = require('./auction/upAll');
const incrementViews = require('./auction/incrementViews');

/*
 * @api [post] /api/auction
 * description: "Создание нового аукциона"
 * tags:
 * - auction
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
 *       assets:
 *         type: array
 *         items:
 *           type: string
 *       message:
 *         type: string
 *       premium:
 *         type: boolean
 *       disableComments:
 *         type: boolean
 *       games:
 *         type: array
 *         items:
 *           type: string
 *       minSkinPrice:
 *         type: number
 *       minBetPrice:
 *         type: number
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/auction',
  expressJoi({
    body: {
      assets: Joi.array().items(Joi.string()).required(),
      message: Joi.string(),
      premium: Joi.boolean(),
      disableComments: Joi.boolean(),
      games: Joi.array().items(Joi.string()),
      minSkinPrice: Joi.number().min(0).max(10000000),
      minBetPrice: Joi.number().min(0).max(10000000),
      osType: Joi.string(),
    },
  }),
  middlewares.checkXAT,
  createAuction,
);

/*
 * @api [get] /api/auction/{auctionId}
 * description: "Получние одного аукциона"
 * tags:
 * - auction
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
 *   name: auctionId
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get(
  '/api/auction/:auctionId',
  expressJoi({
    params: {
      auctionId: Joi.string().min(8).max(100).required(),
    },
  }),
  middlewares.checkXAT,
  getOne,
);

/*
 * @api [post] /api/auction/list
 * description: "Получение списка аукционов."
 * tags:
 * - auction
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
 *       statusType:
 *         type: string
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
  '/api/auction/list',
  expressJoi({
    body: {
      offset: Joi.number().min(0).max(10000),
      limit: Joi.number().min(1).max(10000),
      statusType: Joi.string().min(1).max(100),
      typeStatus: Joi.string().min(1).max(100),
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
          category: Joi.array(),
          quality: Joi.array(),
          rarity: Joi.array(),
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
  getListV3,
);

/*
 * @api [post] /api/auction/listAnonymous
 * description: "Получение списка аукционов без авторизации"
 * tags:
 * - auction
 * consumes:
 * - application/json
 * parameters:
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
 *     required:
 *       - offset
 *       - limit
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/auction/listAnonymous',
  expressJoi({
    body: {
      statusType: Joi.any(),
      filters: Joi.any(),
      offset: Joi.number().min(0).max(10000),
      limit: Joi.number().min(1).max(10000),
    },
  }),
  getListAnonymous,
);

// app.post(
//   '/api/auction/:auctionId/increment_views',
//   expressJoi({
//     params: {
//       auctionId: Joi.string().min(8).max(100).required(),
//     },
//   }),
//   middlewares.checkXAT,
//   incrementViews,
// );

/*
 * @api [post] /api/auction/{auctionId}/up
 * description: "Поднятие аукциона"
 * tags:
 * - auction
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
 *   name: auctionId
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/auction/:auctionId/up',
  expressJoi({
    params: {
      auctionId: Joi.string().min(8).max(100).required(),
    },
  }),
  middlewares.checkXAT,
  upV2,
);

/*
 * @api [get] /api/auction/upAllPrice
 * description: "Получение цены поднятия всех аукционов (своих, открытых)"
 * tags:
 * - auction
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
app.get('/api/auction/upAllPrice', middlewares.checkXAT, upAllPrice);

/*
 * @api [post] /api/auction/upAll
 * description: "Поднятие всех аукционов (своих, открытых)"
 * tags:
 * - auction
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
app.post('/api/auction/upAll', middlewares.checkXAT, upAll);

/*
 * @api [post] /api/auction/{auctionId}/close
 * description: "Закрытие аукциона"
 * tags:
 * - auction
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
 *   name: auctionId
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/auction/:auctionId/close',
  expressJoi({
    params: {
      auctionId: Joi.string().min(8).max(100).required(),
    },
  }),
  middlewares.checkXAT,
  closeV2,
);

/*
 * @api [post] /api/auction/{auctionId}/reopen
 * description: "Переоткрытие аукциона (в статусе processed)"
 * tags:
 * - auction
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
 *   name: auctionId
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.post('/api/auction/:auctionId/reopen', middlewares.checkXAT, reopen);

/*
 * @api [post] /api/auction/{auctionId}/premium
 * description: "Выделение аукциона"
 * tags:
 * - auction
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
 *   name: auctionId
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/auction/:auctionId/premium',
  expressJoi({
    params: {
      auctionId: Joi.string().required(),
    },
  }),
  middlewares.checkXAT,
  makePremium,
);

/*
 * @api [delete] /api/auction/{auctionId}/bet/{betId}
 * description: "Удаление ставки"
 * tags:
 * - auction
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
 *   name: auctionId
 *   type: string
 *   required: true
 *   default: ''
 * - in: path
 *   name: betId
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.del(
  '/api/auction/:auctionId/bet/:betId',
  expressJoi({
    params: {
      auctionId: Joi.string().required(),
      betId: Joi.string().required(),
    },
  }),
  middlewares.checkXAT,
  deleteBetV2,
);

/*
 * @api [post] /api/auction/upAuction
 * description: "Поднятие аукциона (i)"
 * deprecated: true
 * tags:
 * - Будет удалено 01.08.2020
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/auction/upAuction',
  expressJoi({
    body: {
      auctionId: Joi.string().min(8).max(100).required(),
    },
  }),
  middlewares.checkXAT,
  upAuction,
);

/*
 * @api [post] /api/auction/getAuctionsWithoutAuth
 * description: "Получение списка аукционов без авторизации (-I)"
 * tags:
 * - Будет удалено 01.08.2020
 * deprecated: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/auction/getAuctionsWithoutAuth',
  expressJoi({
    body: {
      offset: Joi.number().min(0).max(10000),
      limit: Joi.number().min(1).max(10000),
      statusType: Joi.any(),
      filters: Joi.any(),
    },
  }),
  getListAnonymous,
);

/*
 * @api [post] /api/auction/getAuction
 * description: "Получние одного аукциона (A -I)"
 * tags:
 * - Будет удалено 01.08.2020
 * deprecated: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/auction/getAuction',
  expressJoi({
    body: {
      auctionId: Joi.string().min(8).max(100).required(),
    },
  }),
  middlewares.checkXAT,
  AuctionRoutes.auctionGetAuction,
);

/*
 * @api [post] /api/auction/v2/getAuctionsWithoutAuth
 * description: "Получение списка аукционов без авторизации (A I)"
 * tags:
 * - Будет удалено 01.08.2020
 * deprecated: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/auction/v2/getAuctionsWithoutAuth',
  expressJoi({
    body: {
      offset: Joi.number().min(0).max(10000),
      limit: Joi.number().min(1).max(10000),
      statusType: Joi.string().min(1).max(100),
      filters: Joi.any(),
    },
  }),
  getListAnonymous,
);

/*
 * @api [post] /api/auction/reopen/{auctionId}
 * description: "Переоткрытие аукциона (в статусе processed) (-I)"
 * tags:
 * - Будет удалено 01.08.2020
 * parameters:
 * - in: path
 *   name: auctionId
 *   type: string
 *   required: true
 *   default: ''
 * deprecated: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post('/api/auction/reopen/:auctionId', middlewares.checkXAT, reopen);

/*
 * @api [post] /api/auction/v2/getAuction
 * description: "Получние одного аукциона (A I)"
 * tags:
 * - Будет удалено 01.08.2020
 * deprecated: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/auction/v2/getAuction',
  expressJoi({
    body: {
      auctionId: Joi.string().min(8).max(100).required(),
    },
  }),
  middlewares.checkXAT,
  AuctionRoutes.auctionGetAuction,
);

/*
 * @api [post] /api/auction/close
 * description: "Закрытие аукциона (-I)"
 * tags:
 * - Будет удалено 01.08.2020
 * deprecated: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/auction/close',
  expressJoi({
    body: {
      auctionId: Joi.string().min(8).max(100).required(),
    },
  }),
  middlewares.checkXAT,
  close,
);

/*
 * @api [post] /api/auction/v2/createauction
 * description: "Создание нового аукциона (-A I)"
 * tags:
 * - Будет удалено 01.08.2020
 * deprecated: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/auction/v2/createauction',
  expressJoi({
    body: {
      itemsAssetIds: Joi.any(),
      message: Joi.string(),
      premium: Joi.boolean(),
    },
  }),
  middlewares.checkXAT,
  AuctionRoutes.auctionCreateAuction,
);

/*
 * @api [delete] /api/auction/bet
 * description: "Удаление ставки (-I)"
 * tags:
 * - Будет удалено 01.08.2020
 * deprecated: true
 * responses:
 *   "200":
 *     description: ""
 */
app.del(
  '/api/auction/bet',
  expressJoi({
    body: {
      auctionId: Joi.string().required(),
      betId: Joi.string().required(),
    },
  }),
  middlewares.checkXAT,
  deleteBet,
);

/*
 * @api [post] /api/auction/v2/getAuctions
 * description: "Получение списка аукционов (A I)"
 * tags:
 * - Будет удалено 01.08.2020
 * deprecated: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/auction/v2/getAuctions',
  expressJoi({
    body: {
      offset: Joi.number().min(0).max(10000),
      limit: Joi.number().min(1).max(10000),
      statusType: Joi.string().min(1).max(100),
      filters: Joi.any(),
    },
  }),
  middlewares.checkXAT,
  getList,
);
