const Joi = require('joi');
const expressJoi = require('express-joi-validator');
const middlewares = require('./middlewares');
const getStories = require('./stories/getStories');
const getStory = require('./stories/getStory');
const storiesWatched = require('./stories/storiesWatched');

/*
 * @api [get] /api/stories
 * description: "Получение историй"
 * tags:
 * - stories
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
app.get('/api/stories', middlewares.checkXAT, getStories);

/*
 * @api [get] /api/story/{id}
 * description: "Получение истории по _id"
 * tags:
 * - stories
 * parameters:
 * - in: header
 *   name: x-access-token
 *   type: string
 *   required: true
 * - in: header
 *   name: appVersion
 *   type: string
 *   required: true
 *
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/story/:id', middlewares.checkXAT, getStory);

/*
 * @api [post] /api/stories/watched
 * description: "Установка флага просмотрен для истории "
 * tags:
 * - stories
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
 *   name: id
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/stories/watched',
  expressJoi({
    body: {
      id: Joi.string().required(),
    },
  }),
  middlewares.checkXAT,
  storiesWatched,
);
