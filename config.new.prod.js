const config = {
  port: 3001,
  dbConfig: {
    mongo:
      process.env.MONGODB_URL ||
      '', // &readPreference=secondaryPreferred
    pg: process.env.POSTGRES_URL || '',
  },
  redis: {
    host: '127.0.0.1',
    port: '6379',
    password: 'etVw2tHHM6CE',
  },
  steam: {
    apikey: '',
    ruApikey: '',
    domainname: '',
    ruDomainname: '',
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
    steamFoxKey: '',
  },
  kassa: {
    shopId: '',
    key: '',
  },
  vk: {
    clientId: '',
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

console.log(`env mongo - ${''}`);
console.log(`env postgres - ${''}`);

console.log(`mongo - ${''}`);
console.log(`postgres - ${''}`);

module.exports = '';
