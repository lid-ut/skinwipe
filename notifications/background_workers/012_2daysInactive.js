const User = require('../../src/models/User');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

const upTraderRating = async user => {
  const topUser = await User.find(
    {},
    {
      traderRating: 1,
    },
  )
    .sort({ traderRating: -1 })
    .limit(1)
    .lean()
    .exec();
  if (!topUser[0]) {
    logger.error('Cannot get users from db');
    return 42;
  }
  if (!user.traderRatingFreeUpDate) {
    user.traderRatingFreeUpDate = [];
  }
  user.traderRating = topUser[0].traderRating + 5;
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        traderRating: user.traderRating,
        traderRatingFreeUpDate: user.traderRatingFreeUpDate,
      },
    },
  );
  return user.traderRating;
};

module.exports = async callback => {
  const startTime = Date.now();

  const users = await User.find({
    'notifications.2days': { $ne: true },
    lastActiveDate: {
      $gt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      $lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  })
    .lean()
    .exec();

  logger.info(`[2daysInactive] start for ${users.length} users`);
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    await upTraderRating(user);
    await sendPushV3(user, {
      type: 'INFO',
      title: i18n((user.locale || 'en').toLowerCase()).inactiveUser['2days'].title,
      content: i18n((user.locale || 'en').toLowerCase()).inactiveUser['2days'].content,
    });

    const notifications = user.notifications || {};
    notifications['2days'] = true;
    // eslint-disable-next-line no-await-in-loop
    await User.updateOne(
      { _id: user._id },
      {
        $set: { notifications },
      },
    );
  }

  logger.info(`[2daysInactive] end in ${Date.now() - startTime}ms`);
  callback();
};
