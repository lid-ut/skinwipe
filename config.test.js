const config = {
  port: 3002,
  dbConfig: {
    mongo:
      process.env.MONGODB_URL ||
      '', // &readPreference=secondaryPreferred
    pg: '',
  },
  redis: {
    host: '127.0.0.1',
    port: '6379',
    password: '',
  },
  steam: {
    apikey: '',
    ruApikey: '',
    domainname: 'http://test.skinswipe.gg/',
    ruDomainname: 'https://test.skinswipe.ru/',
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
    shopId: '725677',
    key: '',
  },
  vk: {
    clientId: '6905851',
    clientSecret: '',
    serviceKey: '',
  },
  devtodev: {
    apiKey: '',
  },
  oneSignal: {
    appId: '',
    apiKey: '',
  },
  sentry: {
    api: '',
    workers: '',
    enabled: true,
  },
  production: true,
};

console.log(`env mongo - `);
console.log(`env postgres - `);

console.log(`mongo - `);
console.log(`postgres - `);

module.exports = config;
