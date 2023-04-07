const Joi = require('joi');
const expressJoi = require('express-joi-validator');

const middlewares = require('./middlewares');
const wishlistRoutes = require('./controllers/wishlistRoutes');

/*
 * @api [post] /api/wishlist/items/get
 * description: "Получение списка всех предметов всех юзеров (-A I)"
 * tags:
 * - Будет удалено после 04.09.2020
 * deprecated: true
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
  '/api/wishlist/items/get',
  expressJoi({
    body: {
      offset: Joi.number().min(0).max(10000).required(),
      limit: Joi.number().min(1).max(10000).required(),
      filters: Joi.any().required(),
    },
  }),
  middlewares.checkXAT,
  wishlistRoutes.getItems,
);

/*
 * @api [get] /api/wishlist/selected/get
 * description: "Получение списка всех выбранных из wishlist предметов (-A I)"
 * tags:
 * - Будет удалено 01.08.2020
 * deprecated: true
 * responses:
 *   "200":
 *     description: ""
 */
app.get('/api/wishlist/selected/get', middlewares.checkXAT, wishlistRoutes.getSelectedItems);

/*
 * @api [post] /api/wishlist/selected/set
 * description: "Сохранение списка айтемов (-A I)"
 * tags:
 * - Будет удалено 01.08.2020
 * deprecated: true
 * responses:
 *   "200":
 *     description: ""
 */
app.post(
  '/api/wishlist/selected/set',
  expressJoi({
    body: {
      itemsNames: Joi.any().required(),
    },
  }),
  middlewares.checkXAT,
  wishlistRoutes.setSelectedItems,
);

/*
 * @api [post] /api/wishlist/getInfoForTradeWithOffset
 * description: "Получение информации о скинах для трейда (-A I)"
 * tags:
 * - Будет удалено после 04.09.2020
 * deprecated: true
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
  '/api/wishlist/getInfoForTradeWithOffset',
  expressJoi({
    body: {
      myoffset: Joi.number().min(0).max(1000).required(),
      mylimit: Joi.number().min(0).max(1000).required(),
      hisoffset: Joi.number().min(0).max(1000).required(),
      hislimit: Joi.number().min(0).max(1000).required(),
      filters: Joi.any(),
      filtersPartner: Joi.any(),
      partnerSteamID: Joi.string().min(1).max(50).required(),
    },
  }),
  middlewares.checkXAT,
  wishlistRoutes.wishlistGetInfoForTradeWithOffset,
);
