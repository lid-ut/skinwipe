const Joi = require('joi');
const expressJoi = require('express-joi-validator');

const getScreen = require('./translation/getScreen');
const getScreenV2 = require('./translation/getScreenV2');

/*
 * @api [post] /api/appstrings/screen
 * description: "Получение текста для конкретного экрана (A I)"
 * tags:
 * - Будет удалено 01.08.2020
 * deprecated: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/appstrings/screen',
  expressJoi({
    body: {
      screen: Joi.string(),
      locale: Joi.string(),
      platform: Joi.string(),
    },
  }),
  getScreen,
);

/*
 * @api [get] /api/translation/{screen}/{locale}/{platform}
 * description: "Получение текста для конкретного экрана"
 * tags:
 * - translation
 * consumes:
 * - application/json
 * parameters:
 * - in: path
 *   name: screen
 *   type: string
 *   required: true
 *   default: ''
 * - in: path
 *   name: locale
 *   type: string
 *   required: true
 *   default: ''
 * - in: path
 *   name: platform
 *   type: string
 *   required: true
 *   default: ''
 * responses:
 *   "200":
 *     description: ""
 */
app.get(
  '/api/translation/:screen/:locale/:platform',
  expressJoi({
    params: {
      screen: Joi.string().required(),
      locale: Joi.string().required(),
      platform: Joi.string().required(),
    },
  }),
  getScreenV2,
);
