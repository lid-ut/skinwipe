const Joi = require('joi');
const expressJoi = require('express-joi-validator');
const middlewares = require('./middlewares');

const getUser = require('./faceIt/getUser');
const submit = require('./faceIt/submit');
const gotPrize = require('./faceIt/gotPrize');
const uploadPhoto = require('./faceIt/uploadPhoto');
const getPromotion = require('./faceIt/getPromotion');

app.get(
  '/api/faceit/user',
  middlewares.checkXAT,
  getUser,
);

app.get(
  '/api/faceit/getPromotion',
  middlewares.checkXAT,
  getPromotion,
);

app.post(
  '/api/faceit/user',
  expressJoi({
    body: {
      nickname: Joi.string(),
      realName: Joi.string().required(),
      faceId: Joi.number(),
    },
  }),
  middlewares.checkXAT,
  submit,
);

app.post(
  '/api/faceit/gotPrize',
  middlewares.checkXAT,
  gotPrize,
);

app.post(
  '/api/faceit/uploadPhoto',
  middlewares.checkXAT,
  uploadPhoto,
);
