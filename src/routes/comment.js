const Joi = require('joi');
const expressJoi = require('express-joi-validator');

const middlewares = require('./middlewares');
const createComment = require('./comment/create');
const deleteComment = require('./comment/delete');

/*
 * @api [post] /api/comment/{eType}/{eid}
 * description: "Коммент сущности (auction / trade / skin)"
 * tags:
 * - comment
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
app.post(
  '/api/comment/:eType/:eid',
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
    body: {
      message: Joi.string()
        .min(1)
        .max(200)
        .required(),
    },
  }),
  middlewares.checkXAT,
  createComment,
);

/*
 * @api [delete] /api/comment/{cid}
 * description: "Удаление комментария"
 * tags:
 * - comment
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
 * - in: path
 *   name: cid
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.del(
  '/api/comment/:cid',
  expressJoi({
    params: {
      cid: Joi.string()
        .min(4)
        .max(50)
        .required(),
    },
  }),
  middlewares.checkXAT,
  deleteComment,
);
