const User = require('../../src/models/User');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

async function givePremium(user, code, days) {
  if (user.subInfo && user.subInfo.length) {
    return false;
  }

  user.subInfo.push({
    code,
    subType: 'backend',
    token: `backend-${user.steamId}-${code}`,
    dateCreate: new Date(),
    screen: 'no screen',
    productId: 'backend_skinswipe',
    transactionId: null,
    originalTransactionId: null,
    purchaseDate: Date.now(),
    purchaseDateMs: Date.now(),
    startTime: new Date().getTime(),
    expirationTime: new Date().getTime() + days * 24 * 60 * 60 * 1000,
  });
  user.subscriber = true;
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        subInfo: user.subInfo,
        subscriber: user.subscriber,
      },
    },
  );
  return true;
}

module.exports = async callback => {
  const startTime = Date.now();

  const users = await User.find({
    'notifications.5days': { $ne: true },
    lastActiveDate: {
      $gt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      $lt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  })
    .lean()
    .exec();

  logger.info(`[5daysInactive] start for ${users.length} users`);
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    let result = await givePremium(user, '5daysInactive', 2);
    if (!result) {
      // eslint-disable-next-line no-await-in-loop
      await sendPushV3(user, {
        type: 'INFO',
        title: i18n((user.locale || 'en').toLowerCase()).inactiveUser['5days'].title,
        content: i18n((user.locale || 'en').toLowerCase()).inactiveUser['5days'].content,
      });

      const notifications = user.notifications || {};
      notifications['5days'] = true;
      // eslint-disable-next-line no-await-in-loop
      await User.updateOne(
        { _id: user._id },
        {
          $set: { notifications },
        },
      );
    }
  }

  logger.info(`[5daysInactive] end in ${Date.now() - startTime}ms`);
  callback();
};
