require('../logger');
const User = require('../src/models/User');
const Auction = require('../src/models/Auction');

// prevent from second execution
// process.exit(1);

// User.find({ personaname: 'trapholov' }).then(async users => {
User.find().then(async users => {
  logger.info('Data length:', users.length);
  const saveStartTime = Date.now();

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const percent = (i * 100) / users.length;
    logger.info(`[${Math.round(percent)}%] ${user.personaname} in ${Date.now() - saveStartTime} ms`);
    const createdAuctions = await Auction.countDocuments({
      steamId: user.steamId,
    });
    const finishedAuctions = await Auction.countDocuments({
      steamId: user.steamId,
      status: 'close',
    });
    user.createdAuctions = createdAuctions;
    user.finishedAuctions = finishedAuctions;
    await user.save();
  }
  logger.info('Done!');
  process.exit(1);
});
