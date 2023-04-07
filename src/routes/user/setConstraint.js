const User = require('../../models/User');

module.exports = async function process(req) {
  if (req.body.minInvSum === 0) {
    req.body.minInvSum = null;
  }
  await User.updateOne(
    { steamId: req.user.steamId },
    {
      $set: {
        constraint: {
          premiumOnly: req.body.premiumOnly,
          minInvSum: req.body.minInvSum,
        },
      },
    },
  );
  return { status: 'success' };
};
