require('../logger');
const User = require('../src/models/User');
const sendPushV3 = require('../../src/helpers/sendPushV3');

User.find({ locale: 'ru' }, { steamId: 1, personaname: 1 }).then(async users => {
  // User.find({ steamId: { $in: ['76561198054035851', '76561198835636801'] } }, { steamId: 1, personaname: 1 }).then(async users => {
  for (let i = 0; i < users.length; i++) {
    await sendPushV3(users[i], {
      type: 'INFO',
      title: 'Штурмовое предупреждение',
      content:
        'В Москве рядом с нами ужасная погода, поэтому рекомендуем не пользоваться общественным транспортом сегодня, а создать крутой аукцион. Тем более по промокоду MCHS бонус – 50 монет',
    });
  }

  logger.info('Done!');
  process.exit(1);
});
