require('../logger');
const User = require('../src/models/User');

User.find({ tradeUrl: /"/i }, { steamId: 1, tradeUrl: 1 }).then(async users => {
  for (let i = 0; i < users.length; i++) {
    console.log(users[i].tradeUrl);
    // console.log(users[i].tradeUrl.replace(/"/g, ''));
    await User.updateOne({ steamId: users[i].steamId }, { $set: { tradeUrl: users[i].tradeUrl.replace(/"/g, '') } });
  }
  logger.info('Done!');
  process.exit(1);
});
