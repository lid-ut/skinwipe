require('./logger');
const nanoexpress = require('nanoexpress');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const Sentry = require('@sentry/node');
// const swaggerUi = require('nanoexpress/src/packed/middlewares/swagger-ui'); root/Na2tRv6KT9vf4SGA
const { promisify } = require('util');
const redis = require('redis');
const fileUpload = require('express-fileupload');
const config = require('./config');

require('newrelic');

global.redisClient = null;
if (config.redis) {
  global.redisClient = redis.createClient(config.redis);
  global.redisGet = promisify(global.redisClient.get).bind(global.redisClient);
}

process.on('error', e => console.error(e.stack));
process.on('warning', e => console.error(e.stack));

if (config.sentry.enabled) {
  Sentry.init({ dsn: config.sentry.api });
}

const nexConfig = {};
nexConfig.swagger = require('./swagger.json');

const app = nanoexpress(nexConfig);

app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  }),
);

// app.get(
//   '/api/swagger/',
//   swaggerUi({
//     path: '/api/swagger/',
//     url: '/api/swagger/swagger.json',
//   }),
// );
// app.get('/api/swagger/swagger.json', (req, res) => {
//   res.sendFile('./swagger.json');
// });
// app.get(
//   '/api/swagger/*',
//   swaggerUi({
//     path: '/api/swagger/',
//     url: '/api/swagger/swagger.json',
//   }),
// );

app.use((req, res, next) => {
  res.setHeader('X-Accel-Buffering', 'no');
  req.startTime = Date.now();
  req.ipAddress = req.headers['x-forwarded-for'] || req.getIP();
  req.appVersion = req.headers.appversion || 'N/A';

  if (!req.body) {
    req.body = {};
  }
  if (!req.query) {
    req.query = {};
  }
  if (!req.params) {
    req.params = {};
  }
  req.redisToken = `${req.method}-${req.rawPath}-${req.headers['x-access-token']}-${JSON.stringify(req.params)}-${JSON.stringify(
    req.query,
  )}-${JSON.stringify(req.body)}`;
  req.redisCommonToken = `${req.method}-${req.rawPath}-${JSON.stringify(req.params)}-${JSON.stringify(req.query)}-${JSON.stringify(
    req.body,
  )}`;
  Sentry.setExtra('ip', req.ipAddress);
  Sentry.setExtra('url', req.originalUrl);
  Sentry.setExtra('body', req.body);
  Sentry.setExtra('query', req.query);
  Sentry.setExtra('params', req.params);
  req.startTime = Date.now();
  // logger.info(`[${req.ipAddress}][${req.method}[${req.originalUrl}][v${req.appVersion}] started...`);
  next();
  // logger.info(`[${req.ipAddress}][${req.method}][${req.originalUrl}] finished (${res.rawStatusCode}) (${Date.now() - req.startTime}ms)`);
});

app.setErrorHandler((err, req, res) => {
  console.log(`${req.method} ${req.url}`);
  if (err.stack) {
    logger.error(err.stack);
  } else {
    console.error(err);
  }
  const message = err.data && err.data[0] && err.data[0].message ? `Validation error: ${err.data[0].message}` : 'Internal error';
  Sentry.captureEvent({ message });
  logger.error(`${message}`);
  res.status(500);
  return {
    status: 'error',
    status_code: 500,
    message,
  };
});

app.setValidationErrorHandler((errors, req) => {
  logger.error(`error in [${req.method}] ${req.originalUrl} ${errors}`);
  return { errors };
});

global.app = app;

if (config.redis) {
  app.use(async (req, res) => {
    if (
      [
        '/api/auction/getAuction',
        '/api/auction/getAuctions',
        '/api/auction/getAuctionsWithoutAuth',
        '/api/auction/v2/getAuctions',
        '/api/auction/v2/getauctions',
        '/api/auction/v2/getAuctionsWithoutAuth',
        '/api/auction/v2/getauctionswithoutauth',
        '/api/news/wall/:limit/:offset',
        '/api/support/rooms',
        '/api/trade/v2/getTrades',
        '/api/trade/getInfoForTradeWithOffset',
        '/api/trade/v2/getInfoForTradeWithOffset',
        '/api/getIntersections',
        '/api/v2/getIntersections',
        '/api/v2/getintersections',
        '/api/getIntersection',
        '/api/user/v2/exchange/getItemsWithOffset',
        '/api/user/v2/wishlist/getItemsWithOffset',
      ].indexOf(req.rawPath) === -1
    ) {
      return;
    }
    let cache = await global.redisGet(req.redisToken);
    if (!cache) {
      cache = await global.redisGet(req.redisCommonToken);
    }
    if (cache) {
      res.send(JSON.parse(cache));
    }
  });
}

try {
  // eslint-disable-next-line global-require
  require('./src/routes');
} catch (e) {
  console.log(e);
}
// catch 404
app.use((req, res) => {
  res.status(404).send('not found');
});

process.on('warning', e => console.error(e.stack));

const initSequelize = require('./src/modules/sequelize/init');
const initSettings = require('./src/modules/settings/init');
const initFilters = require('./src/modules/filters/init');

initSettings(() => {});
initFilters(() => {});
initSequelize(() => {
  console.log('server start');
  app.listen(config.port, '0.0.0.0');
});
