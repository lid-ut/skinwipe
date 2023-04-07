const User = require('../../models/User');
const FireCoin = require('../../models/FireCoin');

const getClearPersonaname = require('../../helpers/getClearPersonaname');

module.exports = async function process(req) {
  let name = req.body.personaname;
  if (!req.user.ssNikFirstReward) {
    if (name.toLowerCase().indexOf('skinswipe') !== -1) {
      await new FireCoin({
        steamId: req.user.steamId,
        reason: 'personaname',
        amount: 50,
        used: 0,
        expiration: Date.now() + 24 * 60 * 60 * 1000,
      }).save();
      req.user.ssNikFirstReward = true;
    }
  }
  req.user.personaname = name;
  name = getClearPersonaname(req.user);
  await User.updateOne(
    { steamId: req.user.steamId },
    {
      $set: {
        ssNikFirstReward: req.user.ssNikFirstReward,
        personaname: name,
      },
    },
  );
  return { status: 'success' };
};
