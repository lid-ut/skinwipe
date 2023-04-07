const Joi = require('joi');
const expressJoi = require('express-joi-validator');

const middlewares = require('./middlewares');

const reviews = require('./reviews/list');
const review = require('./reviews/add');

/*
 * @api [post] /api/review/{steamId}
 * description: "Отправка отзыва о пользователе"
 * tags:
 * - feedback
 * consumes:
 * - application/json
 * parameters:
 * - in: body
 *   name: body
 *   description: Request body.
 *   schema:
 *     type: object
 *     properties:
 *       steamId:
 *         type: string
 *       page:
 *         type: number
 *     required:
 *       - name
 *       - email
 *       - comment
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/review/:steamId',
  expressJoi({
    params: {
      steamId: Joi.string().required(),
    },
  }),
  middlewares.checkXAT,
  review,
);

/*
 * @api [post] /api/reviews/{steamId}/{page}
 * description: "ПОлучение отзывов о пользователе"
 * tags:
 * - feedback
 * consumes:
 * - application/json
 * parameters:
 * - in: body
 *   name: body
 *   description: Request body.
 *   schema:
 *     type: object
 *     properties:
 *       steamId:
 *         type: string
 *       page:
 *         type: number
 *     required:
 *       - name
 *       - email
 *       - comment
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/reviews/:steamId/:page',
  expressJoi({
    params: {
      steamId: Joi.string().required(),
      page: Joi.number().required(),
    },
  }),
  middlewares.checkXAT,
  reviews,
);
