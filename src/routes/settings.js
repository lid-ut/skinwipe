const settings = require('./settings/get');
/*
 * @api [get] /api/settings
 * description: "Получение настроек приложения"
 * tags:
 * - settings
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/settings', settings);
