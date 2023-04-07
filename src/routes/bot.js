const Joi = require('joi');
const expressJoi = require('express-joi-validator');
const middlewares = require('./middlewares');

const sellItems = require('./bot/sellItems');

/*
 * @api [post] /api/market/sell
 * description: "p2p продажа предметов пользователя в маркете"
 * tags:
 * - market
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
  '/api/bot/sell',
  expressJoi({
    body: {
      items: Joi.any(),
      web: Joi.any(),
    },
  }),
  middlewares.checkXAT,
  sellItems,
);
