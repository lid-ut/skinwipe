const Joi = require('joi');
const expressJoi = require('express-joi-validator');
const middlewares = require('./middlewares');
const getAds = require('./ads/getAds');
const getV2Ads = require('./ads/getV2Ads');
const adsReward = require('./ads/adsReward');

/*
 * @api [get] /api/ads
 * description: "Получение текущего банера"
 * tags:
 * - ads
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
app.get('/api/ads', middlewares.checkXAT, getAds);

/*
 * @api [get] /api/v2/ads/list
 * description: "Получение текущих банеров"
 * tags:
 * - ads
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
app.get('/api/v2/ads/list', middlewares.checkXAT, getV2Ads);

/*
 * @api [post] /api/ads/reward
 * description: "Получение награды за рекламу"
 * tags:
 * - ads
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
  '/api/ads/reward',
  expressJoi({
    body: {
      id: Joi.string().required(),
    },
  }),
  middlewares.checkXAT,
  adsReward,
);
