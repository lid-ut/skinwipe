const FakeUser = require('../../src/models/FakeUser');
const sendPushToNotRegistered = require('../../src/helpers/sendPushToNotRegistered');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();

  const users = await FakeUser.find({
    'notifications.6daysInactive': { $ne: true },
    lastActiveDate: {
      $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      $lte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
  })
    .lean()
    .exec();

  logger.info(`[6daysNotRegisteredInactive] start for ${users.length} users`);
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    // eslint-disable-next-line no-await-in-loop
    await sendPushToNotRegistered(user, {
      type: 'INFO',
      title: i18n((user.locale || 'en').toLowerCase()).inactiveNotRegistered['3days'].title,
      content: i18n((user.locale || 'en').toLowerCase()).inactiveNotRegistered['3days'].content,
    });

    const notifications = user.notifications || {};
    notifications['6daysInactive'] = true;
    // eslint-disable-next-line no-await-in-loop
    await FakeUser.updateOne(
      { _id: user._id },
      {
        $set: { notifications },
      },
    );
  }

  logger.info(`[6daysNotRegisteredInactive] end in ${Date.now() - startTime}ms`);
  callback();
};
