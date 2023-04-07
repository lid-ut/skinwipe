const FakeUser = require('../../src/models/FakeUser');
const sendPushToNotRegistered = require('../../src/helpers/sendPushToNotRegistered');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();

  const users = await FakeUser.find({
    'notifications.10minutes': { $ne: true },
    lastActiveDate: {
      $gt: new Date(Date.now() - 20 * 60 * 1000),
      $lt: new Date(Date.now() - 10 * 60 * 1000),
    },
  })
    .lean()
    .exec();

  logger.info(`[10minutesNotRegisteredInactive] start for ${users.length} users`);
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    // eslint-disable-next-line no-await-in-loop
    await sendPushToNotRegistered(user, {
      type: 'INFO',
      title: i18n((user.locale || 'en').toLowerCase()).inactiveNotRegistered['10minutes'].title,
      content: i18n((user.locale || 'en').toLowerCase()).inactiveNotRegistered['10minutes'].content,
    });

    const notifications = user.notifications || {};
    notifications['10minutes'] = true;
    // eslint-disable-next-line no-await-in-loop
    await FakeUser.updateOne(
      { _id: user._id },
      {
        $set: { notifications },
      },
    );
  }

  logger.info(`[10minutesNotRegisteredInactive] end in ${Date.now() - startTime}ms`);
  callback();
};
