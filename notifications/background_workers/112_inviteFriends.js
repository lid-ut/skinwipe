const User = require('../../src/models/User');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  await User.find({
    createdAt: {
      $gte: new Date().getTime() - 14 * 60 * 60 * 1000,
      $lte: new Date().getTime() - 12 * 60 * 60 * 1000,
    },
    'notifications.inviteFriends': { $ne: true },
  })
    .cursor()
    .eachAsync(
      async user => {
        logger.info('[inviteFriendsNotification] working for user ' + user.personaname + ' (' + user.steamId + ')');
        const title = i18n((user.locale || 'en').toLowerCase()).inviteFriends.title;
        const content = i18n((user.locale || 'en').toLowerCase()).inviteFriends.content;

        await sendPushV3(user, {
          type: 'INFO',
          title,
          content,
        });
        let notifications = user.notifications || {};
        notifications.inviteFriends = true;
        await User.updateOne({ _id: user._id }, { $set: { notifications } });
      },
      { parallel: 5 },
    );
  callback();
};
