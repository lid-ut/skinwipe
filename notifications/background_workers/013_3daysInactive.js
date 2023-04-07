const User = require('../../src/models/User');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const FireCoin = require('../../src/models/FireCoin');
const addStat = require('../../src/helpers/addStat');

// const changeCoins = require('../../src/helpers/changeCoins');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();

  const users = await User.find({
    'notifications.3days': { $ne: true },
    lastActiveDate: {
      $gt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  })
    .lean()
    .exec();

  logger.info(`[3daysInactive] start for ${users.length} users`);
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    // eslint-disable-next-line no-await-in-loop
    // await changeCoins(users[i], 'inactive', 50);
    // eslint-disable-next-line no-await-in-loop
    await new FireCoin({
      steamId: users[i].steamId,
      reason: 'inactive3',
      amount: 100,
      used: 0,
      expiration: Date.now() + 30 * 60 * 60 * 1000,
    }).save();
    // eslint-disable-next-line no-await-in-loop
    await addStat('fireCoinsAdded', 100);

    // eslint-disable-next-line no-await-in-loop
    await sendPushV3(user, {
      type: 'INFO',
      title: i18n((user.locale || 'en').toLowerCase()).inactiveUser['3days'].title,
      content: i18n((user.locale || 'en').toLowerCase()).inactiveUser['3days'].content,
    });

    const notifications = user.notifications || {};
    notifications['3days'] = true;
    // eslint-disable-next-line no-await-in-loop
    await User.updateOne(
      { _id: user._id },
      {
        $set: { notifications },
      },
    );
  }

  logger.info(`[3daysInactive] end in ${Date.now() - startTime}ms`);
  callback();
};
