const User = require('../../src/models/User');
const Quest = require('../../src/models/Quest');
const QuestEntry = require('../../src/models/QuestEntry');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();

  const users = await User.find({
    'notifications.questsNotActive3Days': { $ne: true },
    lastActiveDate: {
      $gt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  })
    .lean()
    .exec();

  logger.info(`[questsNotActive3Days] start for ${users.length} users`);
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const questEntries = await QuestEntry.find({
      steamId: user.steamId,
      'quests.length': { $ne: 0 },
    });

    if (questEntries.length) {
      // eslint-disable-next-line no-await-in-loop
      await sendPushV3(user, {
        type: 'INFO',
        title: i18n((user.locale || 'en').toLowerCase()).quests['questsNotActive3Days'].title,
        content: i18n((user.locale || 'en').toLowerCase()).quests['questsNotActive3Days'].content,
        platform: 'android',
      });

      const notifications = user.notifications || {};
      notifications['questsNotActive3Days'] = true;
      // eslint-disable-next-line no-await-in-loop
      await User.updateOne(
        { _id: user._id },
        {
          $set: { notifications },
        },
      );
    }
  }

  logger.info(`[questsNotActive3Days] end in ${Date.now() - startTime}ms`);
  callback();
};
