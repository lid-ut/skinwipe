const middlewares = require('./middlewares');
const reset = require('./cooldown/reset');

/*
 * @api [post] /api/cooldown/{type}/reset
 * description: "Сброс кулдауна для премиумов за монеты"
 * tags:
 * - cooldown
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
 *   name: type
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.post('/api/cooldown/:type/reset', middlewares.checkXAT, reset);
