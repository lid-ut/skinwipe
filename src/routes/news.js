const Joi = require('joi');
const expressJoi = require('express-joi-validator');

const middlewares = require('./middlewares');
const wall = require('./news/wall');
const comments = require('./news/comments');
const items = require('./news/items');

/*
 * @api [get] /api/news/wall/{limit}/{offset}
 * description: "Стена"
 * tags:
 * - news
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
 *   name: limit
 *   type: number
 *   required: true
 *   default: '20'
 * - in: path
 *   name: offset
 *   type: number
 *   required: true
 *   default: '0'
 * responses:
 *   "200":
 *     description: ""
 */
app.get(
  '/api/news/wall/:limit/:offset',
  expressJoi({
    params: {
      limit: Joi.number()
        .min(0)
        .max(50),
      offset: Joi.number()
        .min(0)
        .max(10000),
    },
  }),
  middlewares.checkXAT,
  wall,
);

/*
 * @api [get] /api/news/comments/{limit}/{offset}
 * description: "Комментарии"
 * tags:
 * - news
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
 *   name: limit
 *   type: number
 *   required: true
 *   default: '20'
 * - in: path
 *   name: offset
 *   type: number
 *   required: true
 *   default: '0'
 * responses:
 *   "200":
 *     description: ""
 */
app.get(
  '/api/news/comments/:limit/:offset',
  expressJoi({
    params: {
      limit: Joi.number()
        .min(0)
        .max(50),
      offset: Joi.number()
        .min(0)
        .max(10000),
    },
  }),
  middlewares.checkXAT,
  comments,
);

/*
 * @api [get] /api/news/items/{limit}/{offset}
 * description: "Обновления предметов"
 * tags:
 * - news
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
 *   name: limit
 *   type: number
 *   required: true
 *   default: '20'
 * - in: path
 *   name: offset
 *   type: number
 *   required: true
 *   default: '0'
 * responses:
 *   "200":
 *     description: ""
 */
app.get(
  '/api/news/items/:limit/:offset',
  expressJoi({
    params: {
      limit: Joi.number()
        .min(0)
        .max(50),
      offset: Joi.number()
        .min(0)
        .max(10000),
    },
  }),
  middlewares.checkXAT,
  items,
);
