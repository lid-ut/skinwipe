const Joi = require('joi');
const expressJoi = require('express-joi-validator');

const middlewares = require('./middlewares');
const likeEntity = require('./like/entity');

/*
 * @api [put] /api/like/{eType}/{eid}
 * description: "Лайк любого обьекта"
 * tags:
 * - like
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
 *   name: eType
 *   type: string
 *   required: true
 *   default: ''
 * - in: path
 *   name: eid
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.put(
  '/api/like/:eType/:eid',
  expressJoi({
    params: {
      eType: Joi.string()
        .min(2)
        .max(20)
        .required(),
      eid: Joi.string()
        .min(4)
        .max(50)
        .required(),
    },
  }),
  middlewares.checkXAT,
  likeEntity,
);
