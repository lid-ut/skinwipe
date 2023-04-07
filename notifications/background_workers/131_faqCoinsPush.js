const User = require('../../src/models/User');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();

  const users = await User.find(
    {
      faqCoinsSent: { $ne: true },
      createdAt: {
        $gt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        $lt: Date.now() - 60 * 60 * 1000,
      },
    },
    {
      personaname: 1,
      locale: 1,
      steamId: 1,
    },
  )
    .lean()
    .exec();

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    // eslint-disable-next-line no-await-in-loop
    await sendPushV3(user, {
      type: 'INFO',
      title: i18n((user.locale || 'en').toLowerCase()).faqCoinsPush.title,
      content: i18n((user.locale || 'en').toLowerCase()).faqCoinsPush.content,
    });
  }

  logger.info(`[faqCoinsPush] end in ${Date.now() - startTime}ms users: ${users.length}`);
  callback();
};
