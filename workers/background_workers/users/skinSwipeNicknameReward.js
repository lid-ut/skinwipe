require('../../../logger');
const User = require('../../../src/models/User');
const addFireCoins = require('../../../src/helpers/addFireCoins');

module.exports = async () => {
  await User.find({
    personaname: /skinswipe/i,
  })
    .cursor()
    .eachAsync(
      async user => {
        await addFireCoins(user.steamId, 50, Date.now() + 24 * 60 * 60 * 1000, 'personaname');
      },
      { parallel: 5 },
    );
};
