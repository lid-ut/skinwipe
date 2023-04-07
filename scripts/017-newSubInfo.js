require('../logger');
const User = require('../src/models/User');

const usersList = [
  // '76561198054035851', // rtf6x
  // '76561198955048581',
  // '76561198369527546',
  // '76561198854599173',
  // '76561198000607649',
  // '76561198451057306',
  // '76561198957865004',
  // '76561198271240220',
  // '76561197967360288',
  // '76561198396715766',
  // '76561198932718585',
  // '76561198871760071',
  '76561198049866608',
  // '76561198087865628',
];

User.find({ steamId: { $in: usersList } }, { steamId: 1, personaname: 1, subInfo: 1, subscriber: 1, locale: 1 }).then(async users => {
  for (let i = 0; i < users.length; i++) {
    if (!users[i].subInfo) {
      users[i].subInfo = [];
    }
    logger.info(`Working on user [${users[i].personaname}][${users[i].subInfo.length}][${users[i].subscriber}][${users[i].locale}]`);

    if (users[i].subscriber) {
      logger.error(`[${users[i].personaname}] is already sub!`);
      continue;
    }

    const subscription = {
      subType: 'backend',
      store: 'script17',
      token: `backend-${users[i].steamId}`,
      dateCreate: new Date(),
      screen: 'no screen',
      productId: 'backend_skinswipe',
      transactionId: null,
      originalTransactionId: null,
      purchaseDate: Date.now(),
      purchaseDateMs: Date.now(),
      startTime: Date.now(),
      expirationTime: Date.now() + 300 * 24 * 60 * 60 * 1000,
      start: Date.now(),
      expiration: Date.now() + 300 * 24 * 60 * 60 * 1000,
    };

    users[i].subInfo.push(subscription);
    users[i].subscriber = true;
    await users[i].save();
    logger.info(`Done: [${users[i].personaname}][${users[i].subInfo.length}][${users[i].subscriber}]`);
  }

  logger.info('Done!');
  process.exit(1);
});
