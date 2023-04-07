const Transaction = require('../../src/models/Transaction');
const User = require('../../src/models/User');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  await Transaction.find({ token: 'newFriend', notification: { $ne: true } })
    .select('user_steam_id')
    .select('token')
    .select('_id')
    .cursor()
    .eachAsync(
      async transasction => {
        const user = await User.findOne({ steamId: transasction.user_steam_id });
        const title = i18n((user.locale || 'en').toLowerCase()).newFriend.title;
        const content = i18n((user.locale || 'en').toLowerCase()).newFriend.content;

        await sendPushV3(user, {
          type: 'INFO',
          title,
          content,
        });
        await Transaction.updateOne({ _id: transasction._id }, { $set: { notification: true } });
      },
      { parallel: 5 },
    );
  callback();
};
