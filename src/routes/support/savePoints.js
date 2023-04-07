const User = require('../../models/User');

module.exports = async function process(req, res) {
  if (!req.params || !req.params.steamId) {
    logger.warn(`[savePoints] error (data)`);
    return;
  }

  const user = await User.findOne({ steamId: req.params.steamId });
  if (!user) {
    logger.warn(`[savePoints] cannot find user`);
    res.json({ status: false });
    return;
  }

  await User.updateOne({ _id: user._id }, { $set: { mySkinInvitationPoints: req.params.points } });

  res.json({ status: req.params.points });
};
