const User = require('../../src/models/User');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();

  const users = await User.find({
    'notifications.2dayWithoutActivity': { $ne: true },
    lastActiveDate: {
      $gt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      $lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    'stats.createdAuctions': 0,
    'stats.createdAutoTrades': 0,
    'stats.createdTrades': 0,
  })
    .lean()
    .exec();

  logger.info(`[2dayWithoutActivity] start for ${users.length} users`);
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    // eslint-disable-next-line no-await-in-loop
    await sendPushV3(user, {
      type: 'INFO',
      title: i18n((user.locale || 'en').toLowerCase()).inactiveWithoutActivity['2days'].title,
      content: i18n((user.locale || 'en').toLowerCase()).inactiveWithoutActivity['2days'].content,
    });

    const notifications = user.notifications || {};
    notifications['2dayWithoutActivity'] = true;
    // eslint-disable-next-line no-await-in-loop
    await User.updateOne(
      { _id: user._id },
      {
        $set: { notifications },
      },
    );
  }

  logger.info(`[2dayWithoutActivity] end in ${Date.now() - startTime}ms`);
  callback();
};
