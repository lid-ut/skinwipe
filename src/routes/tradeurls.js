const list = require('./tradeUrls/list');

/*
 * @api [get] /api/tradeUrls
 * description: "Получить трейд урлы для проверки трейд бана"
 * tags:
 * - tradeUrls
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/tradeUrls', list);
