const User = require('../../src/models/User');
const Quest = require('../../src/models/Quest');
const QuestEntry = require('../../src/models/QuestEntry');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();

  const questEntries = await QuestEntry.find({
    quests: {
      $elemMatch: {
        rewarded: false,
      },
    },
    updatedAt: {
      $gt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      $lt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  logger.info(`[questsNotRewarded] start for ${questEntries.length} users`);
  for (let i = 0; i < questEntries.length; i++) {
    const entry = questEntries[i];
    const user = await User.findOne({ steamId: entry.steamId });

    // eslint-disable-next-line no-await-in-loop
    await sendPushV3(user, {
      type: 'INFO',
      title: i18n((user.locale || 'en').toLowerCase()).quests['notRewarded'].title,
      content: i18n((user.locale || 'en').toLowerCase()).quests['notRewarded'].content,
      platform: 'android',
    });
  }

  logger.info(`[questsNotRewarded] end in ${Date.now() - startTime}ms`);
  callback();
};
