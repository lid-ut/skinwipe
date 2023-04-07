require('../logger');
const User = require('../src/models/User');
const sendPushV3 = require('../../src/helpers/sendPushV3');

User.find({}, { steamId: 1, personaname: 1, subInfo: 1, subscriber: 1, locale: 1, allSkinsPrice: 1 })
  .sort({ allSkinsPrice: -1 })
  .limit(200)
  .then(async users => {
    for (let i = 0; i < users.length; i++) {
      if (!users[i].subInfo) {
        users[i].subInfo = [];
      }
      logger.info(
        `Working on user [${i + 1}][${users[i].personaname}][price: ${users[i].allSkinsPrice / 100}][sub: ${users[i].subscriber}][${
          users[i].locale
        }]`,
      );

      if (users[i].subscriber) {
        logger.error(`[${users[i].personaname}] is already sub!`);
        continue;
      }

      const subscription = {
        subType: 'backend',
        store: 'script42',
        token: `backend-${users[i].steamId}`,
        dateCreate: new Date(),
        screen: 'no screen',
        productId: 'backend_skinswipe',
        transactionId: null,
        originalTransactionId: null,
        purchaseDate: Date.now(),
        purchaseDateMs: Date.now(),
        startTime: Date.now(),
        expirationTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
        start: Date.now(),
        expiration: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };

      users[i].subInfo.push(subscription);
      users[i].subscriber = true;
      await users[i].save();

      let title = 'Thank you for choosing SkinSwipe';
      let content = "We're gifting you a premium status for 30 days!";
      if (['ru', 'by', 'uz', 'kg', 'kz', 'ua'].indexOf(users[i].locale) > -1) {
        title = 'Спасибо, что выбрал SkinSwipe';
        content = 'Дарим тебе премиум статус на 30 дней!';
      }
      logger.info(title);
      logger.info(content);
      await sendPushV3(users[i], { type: 'INFO', title, content });
      logger.info(`Result: [${users[i].personaname}][sub: ${users[i].subscriber}]`);
    }

    logger.info('Done!');
    process.exit(1);
  });
