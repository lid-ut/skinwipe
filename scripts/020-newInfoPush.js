require('../logger');
const User = require('../src/models/User');
const sendPushV3 = require('../../src/helpers/sendPushV3');

/*
   Locales:
  'ru', 'en', 'uk', 'by', 'fr', 'th', 'es', 'mn', 'hr', 'uz', 'zh', 'kg', 'bg', 'de',
  'pt', 'in', 'ro', 'kz', 'vi', 'ar', 'my', 'ka', 'hu', 'pl', 'ph', 'el', 'sr', 'tm',
  'mm', 'ae', 'cn', 'ua', 'jp', 'fa', 'ax', 'kr', 'np', 'ir', 'tr', 'md', 'cs', 'gb',
  'bo', 'sa', 'au', 'ca', 'nz', 'ai', 'mq', 'az', 'se', 'it', 'nl', 'nb', 'da', 'us',
  'il', 'ee', 'et', 'lv','tw', 'iw', 'cy', 'vn', 'at', 'be', 'ch'
 */
User.find(
  {
    locale: { $in: ['ru', 'by', 'uz', 'kg', 'kz', 'ua'] },
    firebaseTokens: { $nin: [[], null] },
  },
  {
    steamId: 1,
    personaname: 1,
  },
).then(async users => {
  // User.find({ steamId: { $in: ['76561198054035851', '76561198835636801'] } }, { steamId: 1, personaname: 1 }).then(async users => {
  for (let i = 0; i < users.length; i++) {
    await sendPushV3(users[i], {
      type: 'INFO',
      title: 'Раздаем скины на 20 000 рублей',
      content: 'Хочешь новенький нож? Залетай в раздел "конкурсы"!',
    });
  }

  logger.info('Done!');
  process.exit(1);
});
