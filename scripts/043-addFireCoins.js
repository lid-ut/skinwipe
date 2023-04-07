require('../logger');
const User = require('../src/models/User');
const FireCoin = require('../src/models/FireCoin');
const addStat = require('../src/helpers/addStat');

const usersList = [
  '76561198054035851', // rtf6x
  // '76561198241316898', // vMamr
];
User.find(
  {
    steamId: { $in: usersList },
  },
  {
    steamId: 1,
    personaname: 1,
    coinCount: 1,
  },
).then(async users => {
  for (let i = 0; i < users.length; i++) {
    await new FireCoin({
      steamId: users[i].steamId,
      reason: 'script043',
      amount: 500,
      used: 0,
      expiration: Date.now() + 30 * 24 * 60 * 60 * 1000,
    }).save();
    await addStat('fireCoinsAdded', 500);
  }

  logger.info('Done!');
  process.exit(1);
});
