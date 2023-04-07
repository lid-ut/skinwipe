const User = require('../../src/models/User');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();

  const users = await User.find({
    'notifications.7daysNoSub': { $ne: true },
    subscriber: { $ne: true },
    createdAt: {
      $gt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  })
    .lean()
    .exec();

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    // eslint-disable-next-line no-await-in-loop
    await sendPushV3(user, {
      type: 'INFO',
      title: i18n((user.locale || 'en').toLowerCase()).noSub['7days'].title,
      content: i18n((user.locale || 'en').toLowerCase()).noSub['7days'].content,
    });

    const notifications = user.notifications || {};
    notifications['7daysNoSub'] = true;
    // eslint-disable-next-line no-await-in-loop
    await User.updateOne(
      { _id: user._id },
      {
        $set: { notifications },
      },
    );
  }

  logger.info(`[7daysNoSub] end in ${Date.now() - startTime}ms`);
  callback();
};
