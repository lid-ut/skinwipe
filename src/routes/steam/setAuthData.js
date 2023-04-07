const User = require('../../models/User');

module.exports = async function process(req) {
  try {
    if (!req.body.sessionid || !req.body.steamMachineAuth || !req.body.steamLoginSecure) {
      return { status: 'error', message: 'no data' };
    }
    await User.updateOne(
      { steamId: req.user.steamId },
      {
        $set: {
          steamAuth: {
            sessionid: req.body.sessionid,
            steamMachineAuth: req.body.steamMachineAuth,
            steamLoginSecure: req.body.steamLoginSecure,
          },
        },
      },
    );
    return { status: 'success' };
  } catch (e) {
    console.log(e);
    return true;
  }
};
