require('../logger');
const User = require('../src/models/User');
const UserController = require('../src/controllers/UserController');
const changeCoins = require('../src/helpers/changeCoins');

const usersList = [
  // '76561198054035851', // rtf6x
  // '76561198857906882', // ❤尺丫乙囗从❤
  // '76561198371606212', // антоша2007 tastydrop.pro
  // '76561198201380395', // AR/Solo
  // '76561198374707790', // •๖ۣۣۜSђᶖᶆắ•™
  // '76561198438701325', // Dirty Morty-_-
  // '76561198759546657', // disa24
  '76561198049866608', // Majo
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
    await changeCoins(users[i], 'supportCompensation', 1000);
  }

  logger.info('Done!');
  process.exit(1);
});
