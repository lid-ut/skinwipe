const User = require('../../src/models/User');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();

  const users = await User.find({
    'notifications.1dayNoSub': { $ne: true },
    subscriber: { $ne: true },
    createdAt: {
      $gt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      $lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  })
    .lean()
    .exec();

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    // eslint-disable-next-line no-await-in-loop
    await sendPushV3(user, {
      type: 'INFO',
      title: i18n((user.locale || 'en').toLowerCase()).noSub['1day'].title,
      content: i18n((user.locale || 'en').toLowerCase()).noSub['1day'].content,
    });

    const notifications = user.notifications || {};
    notifications['1dayNoSub'] = true;
    // eslint-disable-next-line no-await-in-loop
    await User.updateOne(
      { _id: user._id },
      {
        $set: { notifications },
      },
    );
  }

  logger.info(`[1dayNoSub] end in ${Date.now() - startTime}ms`);
  callback();
};
