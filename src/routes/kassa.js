const Joi = require('joi');
const expressJoi = require('express-joi-validator');
const middlewares = require('./middlewares');
const createPayment = require('./kassa/ymoney/create');
const createMarketPayment = require('./kassa/ymoney/createForMarket');
const paymentNotification = require('./kassa/ymoney/notification');

app.post('/api/kassa/koknot', paymentNotification);

app.get(
  '/api/kassa/:product/:count',
  expressJoi({
    params: {
      product: Joi.string().required(),
      count: Joi.number().required(),
    },
    query: {
      includeSpecialOffers: Joi.boolean(),
    },
  }),
  middlewares.checkXAT,
  createPayment,
);

app.get(
  '/api/kassa/:amount',
  expressJoi({
    params: {
      amount: Joi.number().required(),
    },
    query: {
      includeSpecialOffers: Joi.boolean(),
    },
  }),
  middlewares.checkXAT,
  createMarketPayment,
);

app.get(
  '/api/webkassa/:platform/:amount',
  expressJoi({
    params: {
      amount: Joi.number().required(),
      platform: Joi.string().required(),
    },
    query: {
      includeSpecialOffers: Joi.boolean(),
    },
  }),
  middlewares.checkXAT,
  createMarketPayment,
);
