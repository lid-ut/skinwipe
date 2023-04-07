const middlewares = require('./middlewares');
const getSkin = require('./skin/get');

/*
 * @api [get] /api/skin/{steamId}/{assetId}
 * description: "Инфо о скине"
 * tags:
 * - skin
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
 * - in: path
 *   name: assetId
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/skin/image/:steamId/:assetId', middlewares.checkXAT, getSkin);
