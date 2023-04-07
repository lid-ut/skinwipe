const middlewares = require('./middlewares');
const getSkin = require('./skin/get');
const getSkinHistory = require('./skin/getSkinHistory');
const getByName = require('./skin/getByName');

/*
 * @api [get] /api/skin/priceHistory/{appId}/{name}
 * description: "История цен скина"
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
app.get('/api/skin/priceHistory/:appId/:name', getSkinHistory);

/*
 * @api [get] /api/skin/{name}
 * description: "Инфо о скине по имени"
 * tags:
 * - skin
 * parameters:
 * - in: path
 *   name: name
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/skin/:name', getByName);

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
app.get('/api/skin/:steamId/:assetId', middlewares.checkXAT, getSkin);
