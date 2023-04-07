const fs = require('fs');

let config = {
  port: 3000,
  dbConfig: {
    // TEST
    // mongo:
    //   'mongodb://skinswipe_test:YuRmjeSY3JJCzAnF@mongodb01.skinswipe.local:30228,mongodb02.skinswipe.local:30228/skinswipe_test?authSource=admin&slaveOk=true&replicaSet=rs0', // &readPreference=secondaryPreferred
    // pg: 'postgres://skinswipe_dba:48UEKumxDQTqvvKz@postgres01.skinswipe.local:5433/skinswipe_test',

    // PROD
    mongo:
      '', // &readPreference=secondaryPreferred
    pg: '',
  },
  sendPulse: {
    cId: '',
    cSecret: '',
    listId: '',
  },
  firebaseKey:
    '',
  redis: null,
  ratingSettings: {
    tradeCreate: 25,
    tradeReject: -25,
    tradeAccept: 25,
    superTradeCreate: 50,
    superTradeReject: -15,
    superTradeAccept: 150,
    auctionCreate: 70,
    auctionBetCreate: 50,
    auctionBetAccept: 150,
    auctionBetReject: 85,
  },
  topSettings: {
    tradeFinished: 10,
    bringFriend: 25,
    buySub: 100,
    buyCoinMultiplier: 0.75, // Умножить на кол-во монет
  },
  csgotm: {
    baseKey: 'o9F6BCJQa22ag70UyV9ymGC1u38pOf0',
  },
  steam: {
    apikey: '2DD04345AB68A66EEE41278EB9D1C5B2',
    ruApikey: '5D047E37AE234DF4410DF9B39B891700',
    localhostApiKey: '5AB70CD2DD798CBC366FCC9621F852F2',
    localhost: 'http://localhost:3000/',
    domainname: 'http://localhost:3000/',
    ruDomainname: 'https://skinswipe.ru/',
    loginpage: 'steam/login',
    logoutpage: 'steam/login',
    games_id: {
      DotA2: 570,
      CSGO: 730,
      TF2: 440,
    },
    games_names: {
      570: 'DotA2',
      730: 'CSGO',
      440: 'Team Fortress 2',
    },
    steamFoxKey: 'eUaBQTwmd5NaUdKz',
  },
  kassa: {
    shopId: '700289',
    key: 'test_qL8fpljFe8KZPTWjWrQ_oxIc3XAnPi8h9LKGgbRL8V0',
  },
  IOSKassa: {
    shopId: '711704',
    key: 'live__Rz3iQAPmpJObWxDNPd1rh0PMCYfJZ6FAR9xHlUgSZ0',
  },
  appVersions: {
    android: '181',
    ios: '2.12.1',
    iosBuild: 100001,
  },
  sentry: {
    api: 'https://256bf84f2c194ad5baaf12f9076f2c3f@sentry.io/1396443',
    workers: 'https://c3727315ebea460aac96e482ef291626@sentry.io/1396444',
    enabled: true,
  },
  raygun: {
    apiKey: 'CZuOFPUrIqRSqDmrqkYXRQ',
    enabled: true,
  },
  iap: {
    settings: {
      googlePublicKeyStrLive:
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAndDiHENXuKp7rSGq9GxF1LKKFYDllRm4wljvOggXA8068ENZCJ+gGqBIFAEq8Porck32A6OHL8EQaDzGraJgRFUXJwb8WbWuFzInp79BUWY4DnwVVgDL0n9zOavgTx3Q+b6oNUJFwKBKBHCSivkZEbN9DHkWrVdLEHUHFuYk+BL7R7nOhtApLpqzm3C99pFebWJq55NMDbowfB0aL3cMBJc/SrbasfOjIZ1aGVy8dOmtoA6YMbdxSuUnobztFNZxhGap1iWrYUlkmAOuNy2rN5laE7MpgDAvfqqRXZWahUPUdDqSKzvJBQq//l6BG7k/PUdjwveOZOyapeWwRxP8JQIDAQABPUdjwveOZOyapeWwRxP8JQIDAQAB',
      googleAccToken: '4/bAAftmbdNqj17oRcGWFLxCeRwQDWEUxddBu5pb8R2INLe4m2YeZzoVdxyNtmawluJw2UZs7kEIgq5Www7FAlbf0',
      googleRefToken: '1/l4dKh8o1hVOmMC2KSEmoB4lZz_tSBQcDEwDzMfy24Jk',
      googleClientID: '196862824661-h9s8cve3frhcchjf1dfkkisaspmp6tc8.apps.googleusercontent.com',
      googleClientSecret: '3ARs2lefQRWbKu20WfQcWt2o',
      verbose: false,
      test: false,
    },
    android: {
      clientId: '196862824661-h9s8cve3frhcchjf1dfkkisaspmp6tc8.apps.googleusercontent.com',
      clientSecret: '3ARs2lefQRWbKu20WfQcWt2o',
      refreshToken: '1/l4dKh8o1hVOmMC2KSEmoB4lZz_tSBQcDEwDzMfy24Jk',
    },
    ios: 'bac81d8f403043f6b606e82cb8e6929b',
  },
  oneSignal: {
    appId: '133feeff-3545-49ee-b677-a8bd25d813bf',
    apiKey: 'OTkxMjE5MmMtMmEyYS00NGExLThjNjYtZjQxZjkzMTUxMTgz',
  },
  devtodev: {
    apiKey: 'ak-uk07sjyraW1SP4KJDNceOUB3wqtQLplI',
  },
  production: false,
  tradeUrlsForCheckTradeBan: [
    'https://steamcommunity.com/tradeoffer/new/?partner=154086308&token=4dvRI8iQ',
    'https://steamcommunity.com/tradeoffer/new/?partner=281051170&token=_YvABPGj',
    'https://steamcommunity.com/tradeoffer/new/?partner=93770123&token=CarAZdxX',
  ],
  quests: {
    weeklyReward: 250,
    monthlyReward: 1000,
  },
  fee: 1.07,
  steamapistoken: 'EJPc4SC-foqyeWRpkvGScg0Y5zg',
  postgres: {
    host: '81.163.25.25',
    dialect: 'postgres',
    DB: 'skinswipe',
    USER: 'skinuser',
    PASSWORD: 'h4GH=vey',
    pool: {
      max: 10,
      min: 1,
      acquire: 30000,
      idle: 10000,
    },
  },
  tg: {
    feeKey: 'hfadfEEjwdo123ilk',
  },
  botsManagerUrl: 'http://localhost:3007/api',
  botsManagerStatusHook: 'https://skinswipe.gg/api/bot/trade/status',
  // botsManagerUrl: 'http://localhost:3007/api',
  adColonySecret: 'asdasd',
  revenueCat: {
    ios: 'FsHcbMlksSfJxwMVvHonWglCIvMJtObX',
  },
  best2pay: {
    sector: 2896,
    password: 'test',
    success: 'https://skinswipe.gg/api/best2pay/success',
    fail: 'https://skinswipe.gg/api/best2pay/fail',
  },
  proxies: [
    'http://ily_fomin_mail_ru:0cb214684f@45.80.123.153:30013',
    'http://ily_fomin_mail_ru:0cb214684f@45.80.122.77:30013',
    'http://ily_fomin_mail_ru:0cb214684f@45.80.120.96:30013',
    'http://ily_fomin_mail_ru:0cb214684f@45.80.120.11:30013',
  ],
};

if (process.env.NODE_ENV === 'prod') {
  // eslint-disable-next-line global-require
  config = { ...config, ...require('./config.prod.js') };
} else if (process.env.NODE_ENV === 'new-prod') {
  // eslint-disable-next-line global-require
  config = { ...config, ...require('./config.new.prod.js') };
} else if (process.env.NODE_ENV === 'test') {
  // eslint-disable-next-line global-require
  config = { ...config, ...require('./config.test.js') };
} else if (fs.existsSync(`${__dirname}/config.local.js`)) {
  // eslint-disable-next-line global-require, import/no-unresolved
  config = { ...config, ...require('./config.local.js') };
}

logger.info(`Running NODE_ENV ${process.env.NODE_ENV || 'dev'} && production: ${config.production} ${config.port}`);

module.exports = config;
