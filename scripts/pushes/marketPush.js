require('../../logger');
const i18n = require('../../src/languages');
const getNameAndTag = require('../../src/helpers/getNameAndTag');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const User = require('../../src/models/User');

(async () => {
  console.log('start');
  const user = await User.findOne({ steamId: '76561198114352036' });

  const data = {
    type: 'INFO',
    title: i18n((user.locale || 'en').toLowerCase()).market.acceptSteam.title,
    content: i18n((user.locale || 'en').toLowerCase()).market.acceptSteam.content,
  };

  console.log('send');
  await sendPushV3(user, data);
  console.log('done');
})();
