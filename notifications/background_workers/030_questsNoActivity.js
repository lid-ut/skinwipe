const User = require('../../src/models/User');
const Quest = require('../../src/models/Quest');
const QuestEntry = require('../../src/models/QuestEntry');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();

  const users = await User.find({
    'notifications.questsNoActivity': { $ne: true },
    createdAt: {
      $gt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  })
    .lean()
    .exec();

  logger.info(`[questsNoActivity] start for ${users.length} users`);
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const questEntry = await QuestEntry.findOne({ steamId: user.steamId }).populate('quests.quest');
    if (!questEntry || !questEntry.quests || !questEntry.quests.length) {
      // eslint-disable-next-line no-await-in-loop
      await sendPushV3(user, {
        type: 'INFO',
        title: i18n((user.locale || 'en').toLowerCase()).quests['noActivity'].title,
        content: i18n((user.locale || 'en').toLowerCase()).quests['noActivity'].content,
        platform: 'android',
      });
    }

    const notifications = user.notifications || {};
    notifications['questsNoActivity'] = true;
    // eslint-disable-next-line no-await-in-loop
    await User.updateOne(
      { _id: user._id },
      {
        $set: { notifications },
      },
    );
  }

  logger.info(`[questsNoActivity] end in ${Date.now() - startTime}ms`);
  callback();
};
