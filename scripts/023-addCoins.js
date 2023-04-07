require('../logger');
const User = require('../src/models/User');
const UserController = require('../src/controllers/UserController');
const changeCoins = require('../src/helpers/changeCoins');

const usersList = [
  // '76561198054035851', // rtf6x
  '76561198428168832', // OG BUDA
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
    await changeCoins(users[i], 'supportCompensation', 50);
  }

  logger.info('Done!');
  process.exit(1);
});
