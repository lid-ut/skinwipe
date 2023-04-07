const Joi = require('joi');
const expressJoi = require('express-joi-validator');

const middlewares = require('./middlewares');

const newFeedback = require('./feedback/create');
const newFeedbackPremium = require('./feedback/premium');

/*
 * @api [post] /api/feedback
 * description: "Добавление фидбека"
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
 *       name:
 *         type: string
 *         minLength: 1
 *         maxLength: 100
 *       phone:
 *         type: string
 *         minLength: 5
 *         maxLength: 100
 *       email:
 *         type: string
 *         minLength: 5
 *         maxLength: 100
 *       comment:
 *         type: string
 *         minLength: 5
 *         maxLength: 1000
 *     required:
 *       - name
 *       - email
 *       - comment
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/feedback',
  expressJoi({
    body: {
      name: Joi.string().max(100).required(),
      phone: Joi.string().max(100),
      email: Joi.string().max(100).required(),
      comment: Joi.string().min(5).max(1000).required(),
    },
  }),
  middlewares.checkXAT,
  newFeedback,
);

/*
 * @api [post] /api/feedback/premium
 * description: "Добавление фидбека"
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
 *       name:
 *         type: string
 *         minLength: 1
 *         maxLength: 100
 *       phone:
 *         type: string
 *         minLength: 5
 *         maxLength: 100
 *       email:
 *         type: string
 *         minLength: 5
 *         maxLength: 100
 *       comment:
 *         type: string
 *         minLength: 5
 *         maxLength: 1000
 *     required:
 *       - name
 *       - email
 *       - comment
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/feedback/premium',
  expressJoi({
    body: {
      code: Joi.number().required(),
    },
  }),
  middlewares.checkXAT,
  newFeedbackPremium,
);
