require('../logger');
const User = require('../src/models/User');
const sendPushV3 = require('../src/helpers/sendPushV3');
const i18n = require('../src/languages');

// tradeId: 5cb0625b95e52c50d3ec7c51
// auctionId: 5cb0625b95e52c50d3ec7c51

User.findOne({ steamId: '76561198049866608' }).then(async user => {
  // await sendPushV3(user, {
  //   type: 'INFO',
  //   title: 'Тест!!!',
  //   content: '5 минут...',
  //   key: 'screen',
  //   value: 'premium',
  //   sendDate: Date.now() + 5 * 60 * 1000,
  // });

  await sendPushV3(user, {
    type: 'MARKET_FILTER',
    title: 'Ебааать',
    content: 'Куда течет баланс...',
    json: {
      filters: {
        accountType: 'user',
        csgo: {
          category: [
            {
              items: [
                'Bayonet',
                'Bowie',
                'Butterfly',
                'Falchion',
                'Flip',
                'Gut',
                'Huntsman',
                'Karambit',
                'M9 Bayonet',
                'Navaja',
                'Shadow Daggers',
                'Stiletto',
                'Talon',
                'Ursus',
                'Classic',
                'Skeleton',
                'Nomad',
                'Survival',
                'Paracord',
              ],
              name: 'knifes',
            },
          ],
          float: { from: 0.1, to: 1000.0 },
          statTrack: true,
        },
        price: { max: 1000000, min: 1 },
        tradableOnly: false,
      },

      sort: 'bestDealsAsc',
    },
  });

  // await sendPushV3(user, {
  //   type: 'SKIN_INFO',
  //   steamId: '76561198114352036',
  //   assetId: '1169915880',
  //   title: '{user} оставил комментарий под твоим скином',
  //   content: 'чё охренел он столько не стоит, стики тёртые, на ксмани переплаты нет!!!111',
  // });

  logger.info('Done!');
  process.exit(1);
});
