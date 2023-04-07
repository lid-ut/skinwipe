require('../logger');
const UserSteamItems = require('../src/models/UserSteamItems');
const User = require('../src/models/User');

// prevent from second execution
// process.exit(1);

// User.find({ personaname: 'trapholov' }).then(async users => {
User.find({ allSkinsCount: 0 }).then(async users => {
  console.log(users.length);
  for (let i = 0; i < users.length; i++) {
    // console.log(users[i].steamId);
    // await User.updateOne({ steamId: users[i].steamId }, { $set: { lastSteamItemsUpdate: 9999 } });
  }
  logger.info('Done!');
  process.exit(1);
});
