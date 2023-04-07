const middlewares = require('./middlewares');
const getAllFilters = require('./filters/getAllFilters');
const getAllFiltersV3 = require('./filters/getAllFiltersV3');

/*
 * @api [post] /api/filters/v2/getAllFilters
 * description: "Метод получения фильтров (I)"
 * deprecated: true
 * tags:
 * - Будет удалено 01.08.2020
 * responses:
 *   "200":
 *     description: ""
 */
app.post('/api/filters/v2/getAllFilters', getAllFilters);

app.post('/api/filters/v3/getAllFilters', middlewares.checkXAT, getAllFiltersV3);

/*
 * @api [get] /api/filters
 * description: "Все фильтры"
 * tags:
 * - filters
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
app.get('/api/filters', middlewares.checkXAT, getAllFilters);
