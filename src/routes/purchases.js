const Joi = require('joi');
const expressJoi = require('express-joi-validator');

const middlewares = require('./middlewares');
const getList = require('./purchases/getList');
const purchaseIOS = require('./purchase/ios');
const purchaseAndroid = require('./purchase/android');
const purchaseAndroidAmazon = require('./purchase/android.amazon');

/*
 * @api [get] /api/purchases
 * description: "Получение списка покупок"
 * tags:
 * - purchases
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
 *     description: "Обычный ответ"
 *     examples:
 *      application/json: |
 *        {
 *          status: 'success',
 *          result: {
 *            subscriber: false,
 *            coinCount: 20,
 *            fireCoinsCount: 10,
 *            purchases: [
 *              {
 *                  "type": "premium",
 *                  "createdAt": "2020-07-16T09:33:10.763Z",
 *                  "expiration": "2020-07-16T09:44:53.561Z",
 *                  "expired": true
 *              },
 *              {
 *                  "type": "fireCoins",
 *                  "createdAt": "2020-07-15T08:21:42.193Z",
 *                  "amount": 150,
 *                  "used": 0,
 *                  "expiration": "2020-08-14T08:21:42.192Z",
 *                  "expired": false
 *              },
 *              {
 *                  "type": "transaction",
 *                  "entity": "fireCoins",
 *                  "createdAt": "2020-07-10T10:14:39.500Z",
 *                  "amount": -10
 *              },
 *              {
 *                  "type": "transaction",
 *                  "entity": "coins",
 *                  "createdAt": "2020-06-19T06:33:33.166Z",
 *                  "amount": -10
 *              },
 *              {
 *                  "type": "transaction",
 *                  "entity": "coins",
 *                  "createdAt": "2020-06-09T16:02:50.345Z",
 *                  "amount": 10
 *              },
 *              {
 *                  "type": "premium",
 *                  "createdAt": "2020-02-14T16:18:28.711Z",
 *                  "expiration": "2020-05-14T18:17:21.219Z",
 *                  "expired": true
 *              },
 *            ]
 *        }
 */
app.get('/api/purchases', middlewares.checkXAT, getList);

/*
 * @api [post] /api/user/purchaseAndroid
 * description: "Покупка монет на android"
 * tags:
 * - purchases
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
  '/api/user/purchaseAndroid',
  expressJoi({
    body: {
      JSONdata: Joi.string().min(8).max(1000).required(),
      signature: Joi.string().min(2).max(1000).required(),
    },
  }),
  middlewares.checkXAT,
  purchaseAndroid,
);

/*
 * @api [post] /api/user/purchaseAndroid
 * description: "Покупка монет на android"
 * tags:
 * - purchases
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
  '/api/user/purchase/android/amazon',
  expressJoi({
    body: {
      JSONdata: Joi.string().min(8).max(1000).required(),
      receiptId: Joi.string().min(2).max(1000).required(),
    },
  }),
  middlewares.checkXAT,
  purchaseAndroidAmazon,
);

/*
 * @api [post] /api/user/purchaseIOS
 * description: "Оплата для ios, проверяет в apple"
 * tags:
 * - purchases
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
  '/api/user/purchaseIOS',
  expressJoi({
    body: {
      receipt: Joi.string().required(),
      coinCount: Joi.string().required(),
    },
  }),
  middlewares.checkXAT,
  purchaseIOS,
);
