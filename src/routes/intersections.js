const Joi = require('joi');
const expressJoi = require('express-joi-validator');

const middlewares = require('./middlewares');

const getIntersections = require('./intersections/getIntersections');
const getTradersStats = require('./intersections/getTradersStats');
const getIntersection = require('./intersections/getIntersection');

/*
 * @api [post] /api/getIntersections
 * description: "Получение списка людей для ленты"
 * tags:
 * - people
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
 * - in: body
 *   name: body
 *   description: Request body.
 *   schema:
 *     type: object
 *     properties:
 *       offset:
 *         type: number
 *       limit:
 *         type: number
 *       filters:
 *         type: string
 *       username:
 *         type: string
 *       online:
 *         type: number
 *     required:
 *       - offset
 *       - limit
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/getIntersections',
  expressJoi({
    body: {
      offset: Joi.number().min(0).max(10000).required(),
      limit: Joi.number().min(1).max(10000).required(),
      filters: Joi.any(),
      online: Joi.any(),
      username: Joi.string(),
    },
  }),
  middlewares.checkXAT,
  getIntersections,
);

/*
 * @api [post] /api/getIntersection
 * description: "Получение 1 карточки с конкретным юзером"
 * tags:
 * - people
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
  '/api/getIntersection',
  expressJoi({
    body: {
      steamIdPartner: Joi.string().min(1).max(50).required(),
    },
  }),
  middlewares.checkXAT,
  getIntersection,
);

/*
 * @api [post] /api/getintersection
 * description: "Получение 1 карточки с конкретным юзером (A -I)"
 * tags:
 * - Будет удалено 01.08.2020
 * deprecated: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/getintersection',
  expressJoi({
    body: {
      steamIdPartner: Joi.string().min(1).max(50).required(),
    },
  }),
  middlewares.checkXAT,
  getIntersection,
);

/*
 * @api [post] /api/v2/getIntersections
 * description: "Получение списка людей для ленты (-A)"
 * tags:
 * - people
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
  '/api/v2/getIntersections',
  expressJoi({
    body: {
      offset: Joi.number().min(0).max(10000).required(),
      limit: Joi.number().min(1).max(10000).required(),
      filters: Joi.any(),
      online: Joi.any(),
      username: Joi.string(),
    },
  }),
  middlewares.checkXAT,
  getIntersections,
);

/*
 * @api [get] /api/traders/stats
 * description: "Получение списка людей для ленты (-A)"
 * tags:
 * - people
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
app.get('/api/traders/stats', middlewares.checkXAT, getTradersStats);
