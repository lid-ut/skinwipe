const Joi = require('joi');
const expressJoi = require('express-joi-validator');

const middlewares = require('./middlewares');
const UserRoutes = require('./controllers/userRoutes');
const deleteFriend = require('./user/deleteFriend');
const addFriend = require('./user/addFriend');
const getFriends = require('./user/getFriends');
const readFAQ = require('./user/readFAQ');
const setStatusMessage = require('./user/setStatusMessage');
const getAchievements = require('./user/getAchievements');
const profile = require('./user/profile');
const getUserInfo = require('./user/getUserInfo');
const vkPromo = require('./user/vkPromo');
const logout = require('./user/logout');
const addOsType = require('./user/addOsType');
const setTradeUrl = require('./user/setTradeUrl');
const setApiKey = require('./user/setApiKey');
const setEmail = require('./user/setEmail');
const setBans = require('./user/setBans');
const getUsersBySteamIDs = require('./user/getUsersBySteamIDs');
const setSteamFriends = require('./user/setSteamFriends');
const getCoinCount = require('./user/getCoinCount');
const upTraderRating = require('./user/upTraderRating');
const getUserLimits = require('./user/getUserLimits');
const setPersonaname = require('./user/setPersonaname');
const setAmplitude = require('./user/setAmplitude');
const setConstraint = require('./user/setConstraint');
const setLocale = require('./user/setLocale');
const setFirebaseToken = require('./user/setFirebaseToken');
const setAnonFirebaseToken = require('./user/setAnonFirebaseToken');
const resetInventory = require('./user/resetInventory');
const getSpecialOffers = require('./user/getSpecialOffers');
const declineSpecialOffers = require('./user/declineSpecialOffers');
const getActionPrices = require('./user/getActionPrices');
const sendCode = require('./user/sendCode');
const tradeUrl = require('./user/tradeUrl');

/*
 * @api [get] /api/user/get/{steamId}
 * description: "Получение публичной информации о пользователе (-i)"
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
 * - in: path
 *   name: steamId
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/user/get/:steamId', middlewares.checkXAT, UserRoutes.userGetPublicUserInfo);

/*
 * @api [get] /api/user/profile/{steamId}
 * description: "Получение информации о пользователе, информация отображается в профиле"
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
 * - in: path
 *   name: steamId
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get(
  '/api/user/profile/:steamId',
  expressJoi({
    params: {
      steamId: Joi.string().required(),
    },
  }),
  middlewares.checkXAT,
  profile,
);

/*
 * @api [get] /api/user/tradeUrl/{steamId}
 * description: "Получение tradeUrl пользователя"
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
 * - in: path
 *   name: steamId
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get(
  '/api/user/tradeUrl/:steamId',
  expressJoi({
    params: {
      steamId: Joi.string().required(),
    },
  }),
  middlewares.checkXAT,
  tradeUrl,
);

/*
 * @api [post] /api/user/getUserInfo
 * description: "Получение информации о пользователе, информация отображается в профиле"
 * tags:
 * - profile
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
app.post('/api/user/getUserInfo', middlewares.checkXAT, getUserInfo);

app.post(
  '/api/user/code/send',
  expressJoi({
    body: {
      code: Joi.string().required(),
    },
  }),
  middlewares.checkXAT,
  sendCode,
);

/*
 * @api [post] /api/user/personaname
 * description: "Установка никнейма"
 * tags:
 * - user
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
 *       personaname:
 *         type: string
 *     required:
 *       - personaname
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/user/personaname',
  expressJoi({
    body: {
      personaname: Joi.string().required(),
    },
  }),
  middlewares.checkXAT,
  setPersonaname,
);

/*
 * @api [post] /api/user/amplitude
 * description: "Установка amplitude"
 * tags:
 * - user
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
 *       personaname:
 *         type: string
 *     required:
 *       - personaname
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/user/amplitude',
  expressJoi({
    body: {
      deviceId: Joi.string().required(),
    },
  }),
  middlewares.checkXAT,
  setAmplitude,
);
/*
 * @api [post] /api/user/constraint/set
 * description: "Установка запретов по подписке и стоимости инвентаря"
 * tags:
 * - user
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
 *       premiumOnly:
 *         type: boolean
 *       minInvSum:
 *         type: number
 *     required:
 *       - personaname
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/user/constraint/set',
  expressJoi({
    body: {
      premiumOnly: Joi.boolean().required(),
      minInvSum: Joi.number().required(),
    },
  }),
  middlewares.checkXAT,
  setConstraint,
);

/*
 * @api [get] /api/user/achievements
 * description: "Ачивки"
 * tags:
 * - achievements
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
app.get('/api/user/achievements', middlewares.checkXAT, getAchievements);

/*
 * @api [get] /api/user/logout
 * description: "Логаут"
 * tags:
 * - auth
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
app.get('/api/user/logout', middlewares.checkXAT, logout);

/*
 * @api [post] /api/addOsType
 * description: "Добавление типа устройства"
 * tags:
 * - user
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
 *       os:
 *         type: string
 *       os_version:
 *         type: string
 *       model:
 *         type: string
 *       locale:
 *         type: string
 *       app_version:
 *         type: string
 *     required:
 *       - os
 *       - os_version
 *       - model
 *       - locale
 *       - app_version
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/user/addOsType',
  expressJoi({
    body: {
      os: Joi.any(),
      osInfo: Joi.any(),
      os_version: Joi.any(),
      model: Joi.any(),
      locale: Joi.any(),
      app_version: Joi.any(),
      appVersion: Joi.any(),
    },
  }),
  middlewares.checkXAT,
  addOsType,
);

/*
 * @api [post] /api/user/locale
 * description: "Добавление локали пользователя"
 * tags:
 * - user
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
 *       locale:
 *         type: string
 *     required:
 *       - locale
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/user/locale',
  expressJoi({
    body: {
      locale: Joi.any(),
    },
  }),
  middlewares.checkXAT,
  setLocale,
);

/*
 * @api [get] /api/user/
 * description: "Получение информации о пользователе, информация отображается в профиле"
 * tags:
 * - user
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
app.get('/api/user/', middlewares.checkXAT, getUserInfo);

/*
 * @api [post] /api/user/setTradeUrl
 * description: "Устанавливает tradeUrl по которому в steam создается трейд"
 * tags:
 * - user
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
  '/api/user/setTradeUrl',
  expressJoi({
    body: {
      tradeUrl: Joi.string().min(10).max(100).required(),
    },
  }),
  middlewares.checkXAT,
  setTradeUrl,
);
/*
 * @api [post] /api/user/setApiKey
 * description: "Устанавливает setApiKey"
 * tags:
 * - user
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
  '/api/user/setApiKey',
  expressJoi({
    body: {
      apiKey: Joi.string().min(10).max(100).required(),
    },
  }),
  middlewares.checkXAT,
  setApiKey,
);

/*
 * @api [post] /api/user/setEmail
 * description: "Устанавливает email"
 * tags:
 * - user
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
  '/api/user/setEmail',
  expressJoi({
    body: {
      email: Joi.string().email({ minDomainSegments: 2 }).required(),
    },
  }),
  middlewares.checkXAT,
  setEmail,
);

/*
 * @api [post] /api/user/statusMessage
 * description: "Устанавливает statusMessage"
 * tags:
 * - user
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
  '/api/user/statusMessage',
  expressJoi({
    body: {
      statusMessage: Joi.string().allow('').min(0).max(500),
    },
  }),
  middlewares.checkXAT,
  setStatusMessage,
);

/*
 * @api [patch] /api/user
 * description: "Изменяет юзера"
 * tags:
 * - user
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
app.patch(
  '/api/user',
  expressJoi({
    body: {
      email: Joi.string().allow('').email({ minDomainSegments: 2 }),
      invitationCode: Joi.string().allow('').min(0).max(20),
    },
  }),
  middlewares.checkXAT,
  UserRoutes.updateUser,
);

/*
 * @api [post] /api/user/getCoinCount
 * description: "Получение текущего колличества монет"
 * tags:
 * - user
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
app.post('/api/user/getCoinCount', middlewares.checkXAT, getCoinCount);

/*
 * @api [get] /api/user/money/get
 * description: "Получение текущего баланса"
 * tags:
 * - user
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
app.get('/api/user/money/get', middlewares.checkXAT, UserRoutes.getMoneyCount);

/*
 * @api [post] /api/user/setFirebaseToken
 * description: "Устанавливает firebase токен для отправки пушей"
 * tags:
 * - user
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
 *       firebaseToken:
 *         type: string
 *       device:
 *         type: string
 *       os_type:
 *         type: string
 *     required:
 *       - firebaseToken
 *       - device
 *       - os_type
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/user/setFirebaseToken',
  expressJoi({
    body: {
      firebaseToken: Joi.string().min(8).max(2000).required(),
      device: Joi.string().min(2).max(1000).required(),
      os_type: Joi.string().min(2).max(400).required(),
    },
  }),
  middlewares.checkXAT,
  setFirebaseToken,
);

// /*
//  * @api [post] /api/user/setAnonFirebaseToken
//  * description: "Устанавливает firebase токен для отправки пушей"
//  * tags:
//  * - user
//  * consumes:
//  * - application/json
//  * parameters:
//  * - in: body
//  *   name: body
//  *   description: Request body.
//  *   schema:
//  *     type: object
//  *     properties:
//  *       firebaseToken:
//  *         type: string
//  *       device:
//  *         type: string
//  *       os_type:
//  *         type: string
//  *     required:
//  *       - firebaseToken
//  *       - device
//  *       - os_type
//  * responses:
//  *   "200":
//  *     description: ""
//  */
// app.post(
//   '/api/user/setFirebaseToken',
//   expressJoi({
//     body: {
//       firebaseToken: Joi.string().min(8).max(200).required(),
//       device: Joi.string().min(2).max(100).required(),
//       os_type: Joi.string().min(2).max(40).required(),
//       locale: Joi.string().min(2).max(10).required(),
//     },
//   }),
//   setAnonFirebaseToken,
// );

/*
 * @api [post] /api/user/getUserLimits
 * description: "Получение лимитов пользователя, чтобы фронт знал может ли пользователь выполнить одно из действий(создать супер трейд, создать аукцион, бесплатно поднять аукцион, бесплатно подняться в ленте)"
 * tags:
 * - user
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
app.post('/api/user/getUserLimits', middlewares.checkXAT, getUserLimits);

/*
 * @api [post] /api/user/upTraderRating
 * description: "Апает traderRating юзера, позволяя ему встать на 1 место"
 * tags:
 * - user
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
app.post('/api/user/upTraderRating', middlewares.checkXAT, upTraderRating);

/*
 * @api [post] /api/user/sendTradePushToUser
 * description: "Отправка пуша юзеру партнеру в трейде, при условии что принять не удалось и возникла ошибка steam(Не подключен steam guard, не найден скин в одном из инвентарей, нет возможности обмениваться, ошибки steam)"
 * tags:
 * - user
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
  '/api/user/sendTradePushToUser',
  expressJoi({
    body: {
      partnerSteamId: Joi.string().min(5).max(40).required(),
      message: Joi.string().max(5000).required(),
    },
  }),
  middlewares.checkXAT,
  UserRoutes.userSendTradePushToUser,
);

/*
 * @api [post] /api/user/setBans
 * description: "Установить юзеру его ировые баны"
 * tags:
 * - user
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
 *       bans:
 *         type: object
 *         properties:
 *           TRADEBAN:
 *             type: boolean
 *           CSGO:
 *             type: boolean
 *     required:
 *       - bans
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/user/setBans',
  expressJoi({
    body: {
      bans: Joi.object({
        TRADEBAN: Joi.boolean(),
        CSGO: Joi.boolean(),
      }).required(),
    },
  }),
  middlewares.checkXAT,
  setBans,
);

/*
 * @api [post] /api/user/readFAQ
 * description: "Юзер прочитал FAQ, выдача монет"
 * tags:
 * - user
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
app.post('/api/user/readFAQ', middlewares.checkXAT, readFAQ);

/*
 * @api [post] /api/user/v2/updateItems
 * description: "Обновление инвентаря"
 * tags:
 * - user
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
app.post('/api/user/v2/updateItems', middlewares.checkXAT, UserRoutes.updateItems);

/*
 * @api [post] /api/user/inventory/reset
 * description: "Кнопка обновления инвентаря"
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
 * responses:
 *   "200":
 *     description: ""
 */
app.post('/api/user/inventory/reset', middlewares.checkXAT, resetInventory);

/*
 * @api [post] /api/user/v2/wishlist/getItemsWithOffset
 * description: "Получение списка всех предметов, для создание супер трейда"
 * tags:
 * - user
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
  '/api/user/v2/wishlist/getItemsWithOffset',
  expressJoi({
    body: {
      offset: Joi.number().min(0).max(10000).required(),
      limit: Joi.number().min(1).max(200).required(),
      filters: Joi.any().required(),
      priceCats: Joi.array(),
      sortByPrice: Joi.string(),
      sortByUsers: Joi.string(),
    },
  }),
  middlewares.checkXAT,
  UserRoutes.userWishlistGetItemsWithOffset,
);

/*
 * @api [post] /api/user/v2/exchange/getItemsWithOffset
 * description: "Получение списка предметов, которые есть у пользователя. Используеться для создания супер трейда и создания ставки на аукцион (I)"
 * tags:
 * - Будет удалено после 04.09.2020
 * deprecated: true
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
 *             minLength: 5
 *             maxLength: 80
 *           '730':
 *             type: object
 *             properties:
 *               Rarity:
 *                 type: array
 *                 items:
 *                   type: string
 *               Quality:
 *                 type: array
 *                 items:
 *                   type: string
 *               Weapon:
 *                 type: array
 *                 items:
 *                   type: string
 *               Type:
 *                 type: array
 *                 items:
 *                   type: string
 *               Exterior:
 *                 type: array
 *                 items:
 *                   type: string
 *               ItemSet:
 *                 type: array
 *                 items:
 *                   type: string
 *           '570':
 *             type: object
 *             properties:
 *               Rarity:
 *                 type: array
 *                 items:
 *                   type: string
 *               Quality:
 *                 type: array
 *                 items:
 *                   type: string
 *               Hero:
 *                 type: array
 *                 items:
 *                   type: string
 *               Type:
 *                 type: array
 *                 items:
 *                   type: string
 *               Slot:
 *                 type: array
 *                 items:
 *                   type: string
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/user/v2/exchange/getItemsWithOffset',
  expressJoi({
    body: {
      offset: Joi.number().min(0).max(10000).required(),
      limit: Joi.number().min(1).max(10000).required(),
      filters: Joi.any().required(),
    },
  }),
  middlewares.checkXAT,
  UserRoutes.userExchangeGetItemsWithOffset,
);

/*
 * @api [post] /api/user/friends
 * description: "Добавляет друга"
 * tags:
 * - friends
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
 *       refUserSteamId:
 *         type: string
 *     required:
 *       - refUserSteamId
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/user/friends',
  expressJoi({
    body: {
      steamId: Joi.string().min(12).max(24).required(),
    },
  }),
  middlewares.checkXAT,
  addFriend,
);

/*
 * @api [delete] /api/user/friends
 * description: "Убирает друга"
 * tags:
 * - friends
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
 *       steamId:
 *         type: string
 *     required:
 *       - steamId
 * responses:
 *   "200":
 *     description: ""
 */
app.del(
  '/api/user/friends',
  expressJoi({
    body: {
      steamId: Joi.string().min(12).max(24).required(),
    },
  }),
  middlewares.checkXAT,
  deleteFriend,
);

/*
 * @api [get] /api/user/friends
 * description: "Список друзей"
 * tags:
 * - friends
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
 *   name: offset
 *   type: number
 *   required: true
 *   default: 0
 * - in: query
 *   name: limit
 *   type: number
 *   required: true
 *   default: 10
 * responses:
 *   "200":
 *     description: ""
 */
app.get(
  '/api/user/friends',
  expressJoi({
    query: {
      offset: Joi.number().min(0).max(10000).required(),
      limit: Joi.number().min(1).max(30).required(),
    },
  }),
  middlewares.checkXAT,
  getFriends,
);

/*
 * @api [get] /api/user/friends/{steamId}
 * description: "Список друзей (A I)"
 * tags:
 * - Будет удалено 01.08.2020
 * deprecated: true
 * parameters:
 * - in: path
 *   name: steamId
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get(
  '/api/user/friends/:steamId',
  expressJoi({
    params: {
      steamId: Joi.string().required(),
    },
    query: {
      offset: Joi.number().min(0).max(10000).required(),
      limit: Joi.number().min(1).max(30).required(),
      common: Joi.boolean(),
      name: Joi.string().allow(''),
      status: Joi.string(),
    },
  }),
  middlewares.checkXAT,
  getFriends,
);

/*
 * @api [get] /api/user/{steamId}/friends
 * description: "Список друзей"
 * tags:
 * - friends
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
 *   name: offset
 *   type: number
 *   required: true
 *   default: 0
 * - in: query
 *   name: limit
 *   type: number
 *   required: true
 *   default: 10
 * - in: path
 *   name: steamId
 *   type: string
 *   required: true
 *   default: ''
 * - in: query
 *   name: common
 *   type: boolean
 *   required: false
 *   default: false
 * - in: query
 *   name: name
 *   type: string
 *   required: false
 *   default: 'someone'
 * responses:
 *   "200":
 *     description: ""
 */
app.get(
  '/api/user/:steamId/friends',
  expressJoi({
    params: {
      steamId: Joi.string().required(),
    },
    query: {
      offset: Joi.number().min(0).max(10000).required(),
      limit: Joi.number().min(1).max(30).required(),
      common: Joi.boolean(),
      name: Joi.string().allow(''),
      status: Joi.string(),
    },
  }),
  middlewares.checkXAT,
  getFriends,
);

/*
 * @api [put] /api/user/friends/steam
 * description: "Установить список друзей"
 * tags:
 * - steamfriends
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
 *       steamIds:
 *         type: array
 *         items:
 *           type: string
 *     required:
 *       - steamIds
 * responses:
 *   "200":
 *     description: ""
 */
app.put(
  '/api/user/friends/steam',
  expressJoi({
    body: {
      steamIds: Joi.array().max(100000).required(),
    },
  }),
  middlewares.checkXAT,
  setSteamFriends,
);

/*
 * @api [get] /api/user/friends/steam
 * description: "Получить список друзей из стима"
 * tags:
 * - steamfriends
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
 *   name: offset
 *   type: number
 *   required: true
 * - in: query
 *   name: limit
 *   type: number
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get(
  '/api/user/friends/steam',
  expressJoi({
    query: {
      offset: Joi.number().min(0).max(10000).required(),
      limit: Joi.number().min(1).max(100).required(),
    },
  }),
  middlewares.checkXAT,
  getUsersBySteamIDs,
);

/*
 * @api [post] /api/vk/promo
 * description: "Занести промокод в базу"
 * consumes:
 * - application/json
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/vk/promo',
  middlewares.checkVkAuth,
  expressJoi({
    body: {
      vk_id: Joi.string().min(5).max(30).required(),
      promo: Joi.string().min(4).max(13).required(),
      code_type: Joi.string().min(3).max(15).required(),
      amount: Joi.number().required(),
      daysLimit: Joi.number(),
    },
  }),
  vkPromo,
);

/*
 * @api [get] /api/user/get_special_offers
 * description: "Получить специальные предложения"
 * query:
 * - in: path
 *   name: steamId
 *   type: string
 *   required: true
 *   default: ''
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
app.get('/api/user/get_special_offers', middlewares.checkXAT, getSpecialOffers);

/*
 * @api [get] /api/user/decline_special_offers
 * description: "Отлонить специальные предложения"
 * query:
 * - in: path
 *   name: steamId
 *   type: string
 *   required: true
 *   default: ''
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
app.get('/api/user/decline_special_offers', middlewares.checkXAT, declineSpecialOffers);

/*
 * @api [get] /api/user/get_action_prices
 * description: "Получить стоимость действий"
 * query:
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
app.get('/api/user/get_action_prices', middlewares.checkXAT, getActionPrices);
