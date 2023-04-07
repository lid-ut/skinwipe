require('../logger');
const User = require('../src/models/User');
const checkSubInfo = require('../src/helpers/checkSubInfo');

(async () => {
  const user = await User.findOne({ steamId: '76561198240665598' });

  await checkSubInfo(user);
})();
