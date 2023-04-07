const Joi = require('joi');
const expressJoi = require('express-joi-validator');

const middlewares = require('./middlewares');

const subAndroid = require('./subscription/android');
const subAndroidAmazon = require('./subscription/android.amazon.js');
const subAndroidAmazonReset = require('./subscription/android.amazon.reset.js');
const subIOS = require('./subscription/ios');
const subIOSRevenueCat = require('./subscription/iosRevenueCat.js');
const iosKassa = require('./subscription/iosKassa');
const iosKassaToken = require('./subscription/iosKassaToken');
const getSubState = require('./subscription/getSubState');

/*
 * @api [post] /api/user/subAndroidTest
 * description: "Подписка на андроид, устаревший метод"
 * tags:
 * - subscription
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
  '/api/user/subAndroidTest',
  expressJoi({
    body: {
      purchaseToken: Joi.string().min(8).max(1000).required(),
      JSONdata: Joi.string().min(8).max(1000).required(),
      signature: Joi.string().min(2).max(1000).required(),
      screen: Joi.string().min(2).max(1000),
      sku: Joi.string().min(1).max(1000),
    },
  }),
  middlewares.checkXAT,
  subAndroid,
);

/*
 * @api [post] /api/user/sub/android
 * description: "Подписка на андроид, новый метод"
 * tags:
 * - subscription
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
  '/api/user/sub/android/google',
  expressJoi({
    body: {
      purchaseToken: Joi.string().min(8).max(1000).required(),
      JSONdata: Joi.string().min(8).max(1000).required(),
      signature: Joi.string().min(2).max(1000).required(),
      screen: Joi.string().min(2).max(1000),
    },
  }),
  middlewares.checkXAT,
  subAndroid,
);

/*
 * @api [post] /api/user/sub/android/amazon
 * description: "Подписка на андроид amazon, новый метод"
 * tags:
 * - subscription
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
  '/api/user/sub/android/amazon',
  expressJoi({
    body: {
      JSONdata: Joi.string().min(8).max(1000).required(),
      receiptId: Joi.string().min(8).max(1000).required(),
    },
  }),
  middlewares.checkXAT,
  subAndroidAmazon,
);

/*
 * @api [post] /api/user/sub/android/amazon/reset
 * description: "Удаление amazon подписки"
 * tags:
 * - subscription
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
app.post('/api/user/sub/android/amazon/reset', middlewares.checkXAT, subAndroidAmazonReset);

/*
 * @api [post] /api/user/subIOS
 * description: "Подписка для ios, проверяет в apple"
 * tags:
 * - subscription
 * consumes:
 * - application/jsonandroid/amazon
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
  '/api/user/subIOS',
  expressJoi({
    body: {
      receipt: Joi.string().required(),
      screen: Joi.string().min(2).max(100000),
    },
  }),
  middlewares.checkXAT,
  subIOS,
);

/*
 * @api [post] /api/user/sub/ios/cat
 * description: "Подписка для ios, проверяет в apple"
 * tags:
 * - subscription
 * consumes:
 * - application/jsonandroid/amazon
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
app.post('/api/user/sub/ios/cat', middlewares.checkXAT, subIOSRevenueCat);

/*
 * @api [post] /api/subscription/iosKassa
 * description: "Подписка для ios, проверяет в yandex.kassa"
 * tags:
 * - subscription
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
 *       token:
 *         type: string
 *     required:
 *       - token
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/subscription/iosKassa',
  expressJoi({
    body: {
      token: Joi.string().required(),
    },
  }),
  middlewares.checkXAT,
  iosKassa,
);

/*
 * @api [post] /api/subscription/iosKassaToken
 * description: "Подписка для ios, записывает токен и выдаёт confirmation_url"
 * tags:
 * - subscription
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
 *       token:
 *         type: string
 *       amount:
 *         type: string
 *       months:
 *         type: number
 *     required:
 *       - token
 *       - amount
 *       - months
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/subscription/iosKassaToken',
  expressJoi({
    body: {
      token: Joi.string().required(),
      amount: Joi.string().required(),
      months: Joi.number().required(),
    },
  }),
  middlewares.checkXAT,
  iosKassaToken,
);

/*
 * @api [post] /api/user/getSubState
 * description: "Получение информации о подписке, используется при старте приложения"
 * tags:
 * - subscription
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
app.post('/api/user/getSubState', middlewares.checkXAT, getSubState);
