const getIOS = require('./scripts/getIOS');
const getIosV2 = require('./scripts/getIosV2');
const getAndroid = require('./scripts/getAndroid');
const getAndroidV2 = require('./scripts/getAndroidV2');
const error = require('./scripts/error');

/*
 * @api [get] /api/scripts/ios
 * description: "Отдает скрипты для ios"
 * tags:
 * - scripts
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/scripts/ios', getIOS);

/*
 * @api [get] /api/scripts/ios/v2
 * description: "Отдает скрипты для ios"
 * tags:
 * - scripts
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/scripts/ios/v2', getIosV2);

/*
 * @api [get] /api/scripts/android
 * description: "Отдает скрипты для android"
 * tags:
 * - scripts
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/scripts/android', getAndroid);

/*
 * @api [get] /api/scripts/android/v2
 * description: "Отдает скрипты для android"
 * tags:
 * - scripts
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/scripts/android/v2', getAndroidV2);

/*
 * @api [post] /api/scripts/error
 * description: "Записывает ошибку в базу"
 * tags:
 * - scripts
 * parameters:
 * - in: body
 *   name: body
 *   description: Request body.
 *   schema:
 *     type: object
 *     properties:
 *       screen:
 *         type: string
 *       url:
 *         type: string
 *       script:
 *         type: string
 *       scriptResult:
 *         type: string
 *       pageContent:
 *         type: string
 * responses:
 *   "200":
 *     description: ""
 */
app.post('/api/scripts/error', error);
