require('../logger');
const UserSteamItems = require('../src/models/UserSteamItems');
const User = require('../src/models/User');

// prevent from second execution
// process.exit(1);

// User.find({ personaname: 'trapholov' }).then(async users => {
UserSteamItems.aggregate([{ $group: { _id: '$steamId', count: { $sum: 1 } } }, { $match: { _id: { $ne: null }, count: { $lt: 2 } } }]).then(
  async users => {
    console.log(users.length);
    for (let i = 0; i < users.length; i++) {
      console.log(users[i]._id);
      await User.updateOne({ steamId: users[i]._id }, { $set: { lastSteamItemsUpdate: 999 } });
    }
    logger.info('Done!');
    process.exit(1);
  },
);
