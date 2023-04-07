const Joi = require('joi');
const expressJoi = require('express-joi-validator');
const middlewares = require('./middlewares');
const createPay = require('./kassa/best2pay/createPay');
const createOut = require('./kassa/best2pay/createOut');
const createCard = require('./kassa/best2pay/createCard');
const notification = require('./kassa/best2pay/notification');

app.post('/api/best2pay/notif', notification);

app.get(
  '/api/best2pay/:amount',
  expressJoi({
    params: {
      amount: Joi.number().required(),
    },
  }),
  middlewares.checkXAT,
  createPay,
);

app.post(
  '/api/best2pay/out/:amount',
  expressJoi({
    params: {
      amount: Joi.number().required(),
    },
  }),
  middlewares.checkXAT,
  createOut,
);

app.post('/api/best2pay/card/add', middlewares.checkXAT, createCard);
