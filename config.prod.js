const config = {
  port: 3001,
  dbConfig: {
    mongo: 'mongodb://swprod:RZ66He3y@116.202.249.214:30228/skinswipe_prod',
  },
  redis: null,
  // redis: {
  //   host: '127.0.0.1',
  //   password: 'HaoXcjD6upmJ8nQrmS5pzQW7TH7elmDnhYmSqGB8RimQxAfgJ27FRs88Bc5Rk260M3EoShiJeSAlvE1f',
  // },
  steam: {
    apikey: '***',
    ruApikey: '***',
    domainname: '***',
    ruDomainname: '***',
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

module.exports = config;
