const middlewares = require('./middlewares');

const ethereumWallet = require('../modules/ethereum');
const ethereumWalletBalance = require('../modules/ethereum/balance');

/*
 * @api [get] /api/wallet/ethereum
 * description: "Получение адреса для эфира"
 * tags:
 * - skin
 * parameters:
 * - in: path
 *   name: name
 *   type: string
 *   required: true
 *   default: ''
 * - in: path
 *   name: appId
 *   type: number
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/wallet/ethereum', middlewares.checkXAT, ethereumWallet);

/*
 * @api [get] /api/wallet/ethereum/balance
 * description: "Получение адреса для эфира"
 * tags:
 * - skin
 * parameters:
 * - in: path
 *   name: name
 *   type: string
 *   required: true
 *   default: ''
 * - in: path
 *   name: appId
 *   type: number
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/wallet/ethereum/balance', middlewares.checkXAT, ethereumWalletBalance);
