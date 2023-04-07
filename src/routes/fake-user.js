const Joi = require('joi');
const expressJoi = require('express-joi-validator');

const middlewares = require('./middlewares');
const UserRoutes = require('./controllers/userRoutes');
const createFakeUser = require('./fakeUser/create');
const updateFakeUser = require('./fakeUser/update');
const deleteFakeUser = require('./fakeUser/delete');

/*
 * @api [post] /api/fake_user
 * description: "Создание фейкового пользователя"
 * tags:
 * - fake_user
 * consumes:
 * - application/json
 * parameters:
 * - in: body
 *   name: body
 *   description: Request body.
 *   schema:
 *     type: object
 *     properties:
 *       firebaseToken:
 *         type: string
 *       device:
 *         type: string
 *       os_type:
 *         type: string
 *     required:
 *       - firebaseToken
 *       - device
 *       - os_type
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/fake_user',
  expressJoi({
    body: {
      firebaseToken: Joi.string().min(8).max(200).required(),
      device: Joi.string().min(2).max(100).required(),
      os_type: Joi.string().min(2).max(40).required(),
    },
  }),
  createFakeUser,
);

/*
 * @api [put] /api/fake_user/{id}
 * description: "Обновления fake пользователя"
 * tags:
 * - fake_user
 * consumes:
 * - application/json
 * parameters:
 * - in: body
 *   name: body
 *   description: Request body.
 *   schema:
 *     type: object
 *     properties:
 *       firebaseToken:
 *         type: string
 *       device:
 *         type: string
 *       os_type:
 *         type: string
 * responses:
 *   "200":
 *     description: ""
 */
app.put('/api/fake_user/:id', expressJoi({}), updateFakeUser);

/*
 * @api [delete] /api/fake_user/{id}
 * description: "Удаление временного пользователя"
 * tags:
 * - fake_user
 * consumes:
 * - application/json
 * parameters:
 * - in: body
 *   name: body
 *   description: Request body.
 *   schema:
 *     type: object
 *     properties:
 *       userId:
 *         type: string
 *     required:
 *       - userId
 * responses:
 *   "200":
 *     description: ""
 */
app.del('/api/fake_user/:id', expressJoi({}), deleteFakeUser);
