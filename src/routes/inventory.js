const Joi = require('joi');
const expressJoi = require('express-joi-validator');
const middlewares = require('./middlewares');

const getBlackList = require('./inventory/getBlackList');
const blackList = require('./inventory/blackList');
const myInventory = require('./inventory/myInventory');
const userInventory = require('./inventory/userInventory');
const superInventory = require('./inventory/superInventory');

/*
 * @api [get] /api/inventory/blackList
 * description: "Заблокированные предметы"
 * tags:
 * - inventory
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/inventory/blackList', middlewares.checkXAT, getBlackList);

/*
 * @api [post] /api/inventory/blackList
 * description: "Блокировка предметов"
 * tags:
 * - inventory
 * consumes:
 * - application/json
 * parameters:
 * - in: body
 *   name: body
 *   description: Request body.
 *   schema:
 *     type: object
 *     properties:
 *       asset:
 *         type: string
 *       clear:
 *         type: boolean
 *     required:
 *       - assets
 *       - clear
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/inventory/blackList',
  expressJoi({
    body: {
      asset: Joi.string().min(5).max(30).required(),
      clear: Joi.boolean().required(),
    },
  }),
  middlewares.checkXAT,
  blackList,
);

/*
 * @api [post] /api/inventory/super/{offset}/{limit}
 * description: "Получение списка предметов пользователей для создания супертрейда"
 * tags:
 * - inventory
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
  '/api/inventory/super/:offset/:limit',
  expressJoi({
    body: {
      filters: Joi.any().required(),
      sortBy: Joi.string(),
      sortOrder: Joi.number(),
    },
  }),
  middlewares.checkXAT,
  superInventory,
);

/*
 * @api [post] /api/inventory/{steamId}/{offset}/{limit}
 * description: "Получение списка предметов конкретного пользователя"
 * tags:
 * - inventory
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
 *   name: steamId
 *   type: string
 *   required: true
 *   default: '0'
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
  '/api/inventory/:steamId/:offset/:limit',
  expressJoi({
    body: {
      filters: Joi.any().required(),
    },
  }),
  middlewares.checkXAT,
  userInventory,
);

/*
 * @api [post] /api/inventory/{offset}/{limit}
 * description: "Получение списка предметов текущего пользователя"
 * tags:
 * - inventory
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
  '/api/inventory/:offset/:limit',
  expressJoi({
    body: {
      filters: Joi.any().required(),
    },
  }),
  middlewares.checkXAT,
  myInventory,
);
