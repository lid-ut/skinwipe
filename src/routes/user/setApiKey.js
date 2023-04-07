const User = require('../../models/User');

module.exports = async function process(req) {
  await User.updateOne(
    { steamId: req.user.steamId },
    {
      $set: {
        apiKey: req.body.apiKey,
      },
    },
  );
  return { status: 'success' };
};
