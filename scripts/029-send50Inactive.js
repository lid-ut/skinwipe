require('../logger');
const User = require('../src/models/User');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const UserController = require('../src/controllers/UserController');

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
    // lastActiveDate: {$lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)},
    steamId: '76561198114352036',
    firebaseTokens: { $nin: [[], null] },
  },
  {
    steamId: 1,
    personaname: 1,
  },
).then(async users => {
  // User.find({ steamId: { $in: ['76561198054035851', '76561198835636801'] } }, { steamId: 1, personaname: 1 }).then(async users => {

  console.log('start');
  for (let i = 0; i < users.length; i++) {
    if (!(await UserController.checkInactive(users[i].steamId))) {
      console.log('029-send50Inactive', `user = ${users[i].steamId}`);
      // await changeCoins(users[i], 'inactive', 50);

      await sendPushV3(users[i], {
        type: 'INFO',
        title: 'Привет) держи 50 монеток🎁',
        //'Всем крутым ребятам по 50 монет 😎',
        content: 'Попробуй премиум аукцион, он станет золотым)',
        // 'Будь в курсе всех крутых розыгрышей от SkinSwipe. Введи свою почту нажав на кнопку «Bведите промокод» в разделе «Аккаунт» и получи 50 монет 🎁',
      });
    }
    console.log('3');
  }

  logger.info('Done!');
  process.exit(1);
});
