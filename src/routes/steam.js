const login = require('./auth/login');
const loginURL = require('./auth/loginURL');
const getInventoriesStatus = require('./steam/getInventoriesStatus');

/*
 * @api [get] /api/steam/getLoginUrl
 * description: "Получение ссылки для openid авторизации через стим, нужно чтобы мы узнали steamId юзера (A -I)"
 * tags:
 * - Будет удалено 01.08.2020
 * deprecated: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/steam/getLoginUrl', loginURL);

/*
 * @api [get] /api/steam/loginURL
 * description: "Получение ссылки для openid авторизации через стим"
 * tags:
 * - auth
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/steam/loginURL', loginURL);

/*
 * @api [get] /api/steam/login
 * description: "Callback ссылка для steam, авторизует по openid и отдает steamId"
 * tags:
 * - auth
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/steam/login', login);

/*
 * @api [get] /api/steam/inventories/status
 * description: "Returns steam inventories status"
 * tags:
 * - auth
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/steam/inventories/status', getInventoriesStatus);
