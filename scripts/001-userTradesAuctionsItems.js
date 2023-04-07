require('../logger');
const User = require('../src/models/User');
const UserSteamItems = require('../src/models/UserSteamItems');
const UserController = require('../src/controllers/UserController');

// prevent from second execution
// process.exit(1);

User.find().then(async users => {
  logger.info('Data length: %j', users.length);
  const saveStartTime = Date.now();

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const percent = (i * 100) / users.length;
    logger.info(`[${Math.round(percent)}%] ${user.personaname} in ${Date.now() - saveStartTime} ms`);

    const assets = await UserSteamItems.find({ steamId: user.steamId }).distinct('steamItems');
    const traderInfo = await UserController.getTraderInfo(user);
    user.allSkinsCount = assets.length;
    user.allSkinsPrice = assets.reduce(
      (sum, cur) => parseInt(sum || 0, 10) + parseInt((cur.price && cur.price.steam ? cur.price.steam.safe : 0) || 0, 10),
      0,
    );
    user.stats.createdTrades = traderInfo.createdTrades;
    user.stats.finishedTrades = traderInfo.finishedTrades;
    user.stats.createdAutoTrades = traderInfo.createdAutoTrades;
    user.stats.finishedAutoTrades = traderInfo.finishedAutoTrades;
    await user.save();
  }
  logger.info('Done!');
  process.exit(1);
});
