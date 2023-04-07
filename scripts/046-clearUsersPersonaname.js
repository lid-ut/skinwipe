require('../logger');
const User = require('../src/models/User');

User.find({ personaname: /\.house/i }).then(async users => {
  for (let i = 0; i < users.length; i++) {
    console.log(users[i].personaname);
    await User.updateOne({ steamId: users[i].steamId }, { $set: { personaname: users[i].steamId } });
  }
  logger.info('Done!');
  process.exit(1);
});
