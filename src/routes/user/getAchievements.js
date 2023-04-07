const User = require('../../models/User');
const sendPushV3 = require('../../helpers/sendPushV3');
const i18n = require('../../languages');

module.exports = async function getAchievements(req, res) {
  const user = req.user;
  const achievements = req.user.achievements || [];

  if (!user.stats) {
    user.stats = {};
  }
  if (!user.stats.createdTrades) {
    user.stats.createdTrades = 0;
  }
  if (user.stats.createdTrades > 0 && achievements.indexOf('oneTradeCreated') === -1) {
    achievements.push('oneTradeCreated');
    const title = i18n(user.locale || 'en').achievements.oneTradeCreated.title;
    const content = i18n(user.locale || 'en').achievements.oneTradeCreated.content;
    await sendPushV3(user, {
      type: 'INFO',
      title,
      content,
    });
  }

  if (!user.stats.acceptedTrades) {
    user.stats.acceptedTrades = 0;
  }
  if (user.stats.acceptedTrades > 9 && achievements.indexOf('tenTradesAccepted') === -1) {
    achievements.push('tenTradesAccepted');
    const title = i18n(user.locale || 'en').achievements.tenTradesAccepted.title;
    const content = i18n(user.locale || 'en').achievements.tenTradesAccepted.content;
    await sendPushV3(user, {
      type: 'INFO',
      title,
      content,
    });
  }
  if (user.stats.acceptedTrades > 49 && achievements.indexOf('fiftyTradesAccepted') === -1) {
    achievements.push('fiftyTradesAccepted');
    const title = i18n(user.locale || 'en').achievements.fiftyTradesAccepted.title;
    const content = i18n(user.locale || 'en').achievements.fiftyTradesAccepted.content;
    await sendPushV3(user, {
      type: 'INFO',
      title,
      content,
    });
  }
  if (user.stats.acceptedTrades > 99 && achievements.indexOf('hundredTradesAccepted') === -1) {
    achievements.push('hundredTradesAccepted');
    const title = i18n(user.locale || 'en').achievements.hundredTradesAccepted.title;
    const content = i18n(user.locale || 'en').achievements.hundredTradesAccepted.content;
    await sendPushV3(user, {
      type: 'INFO',
      title,
      content,
    });
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        achievements,
      },
    },
  );
  res.json({ status: 'success', achievements });
};
