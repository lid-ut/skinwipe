const User = require('../../src/models/User');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();

  const users = await User.find({
    'notifications.twoDaysAfterInactive': { $ne: true },
    gotPremiumDiscountAfterInactive: { $ne: true },
    $or: [
      {
        lastActiveDate: {
          $gte: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
          $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      {
        lastActiveDate: {
          $gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          $lte: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
        },
      },
    ],
  })
    .lean()
    .exec();

  logger.info(`[twoDaysAfterInactive] start for ${users.length} users`);
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    // eslint-disable-next-line no-await-in-loop
    await sendPushV3(user, {
      type: 'INFO',
      title: i18n((user.locale || 'en').toLowerCase()).inactiveUser['twoDaysAfterInactive'].title,
      content: i18n((user.locale || 'en').toLowerCase()).inactiveUser['twoDaysAfterInactive'].content,
    });

    const notifications = user.notifications || {};
    notifications['twoDaysAfterInactive'] = true;
    // eslint-disable-next-line no-await-in-loop
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          notifications,
          gotPremiumDiscountAfterInactive: true,
          gotPremiumDiscountDateStart: new Date(),
        },
      },
    );
  }

  logger.info(`[twoDaysAfterInactive] end in ${Date.now() - startTime}ms`);
  callback();
};
