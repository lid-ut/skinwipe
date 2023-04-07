const User = require('../../models/User');

module.exports = async function process(req) {
  await User.updateOne(
    { steamId: req.user.steamId },
    {
      $set: {
        amplitudeDeviceId: req.body.deviceId,
      },
    },
  );
  return { status: 'success' };
};
