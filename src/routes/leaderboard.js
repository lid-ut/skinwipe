const Joi = require('joi');
const expressJoi = require('express-joi-validator');

const middlewares = require('./middlewares');

const getLeaderboard = require('./leaderboard/getList');
const getLeaderboardV2 = require('./leaderboard/getListV2');

/*
 * @api [get] /api/user/leaderboard
 * description: "Получить список лидеров (A I)"
 * tags:
 * - Будет удалено 03.08.2020
 * deprecated: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get(
  '/api/user/leaderboard',
  expressJoi({
    query: {
      offset: Joi.number()
        .min(0)
        .max(10000)
        .required(),
      limit: Joi.number()
        .min(1)
        .max(100)
        .required(),
    },
  }),
  middlewares.checkXAT,
  getLeaderboard,
);

/*
 * @api [get] /api/leaderboard/{offset}/{limit}
 * description: "Получить список лидеров"
 * tags:
 * - leaderboard
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
 *   name: offset
 *   type: number
 *   required: true
 * - in: path
 *   name: limit
 *   type: number
 *   required: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get(
  '/api/leaderboard',
  expressJoi({
    params: {
      offset: Joi.number()
        .min(0)
        .max(10000)
        .required(),
      limit: Joi.number()
        .min(1)
        .max(100)
        .required(),
    },
  }),
  middlewares.checkXAT,
  getLeaderboardV2,
);
