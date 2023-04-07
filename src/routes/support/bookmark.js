const User = require('../../models/User');

module.exports = async function process(req, res) {
  if (!req.params || !req.params.steamId) {
    logger.warn(`[bookmark] error (data)`);
    return;
  }

  const user = await User.findOne({ steamId: req.params.steamId });
  if (!user) {
    logger.warn(`[bookmark] cannot find user`);
    res.json({ status: false });
    return;
  }

  user.bookMarked = !(user.bookMarked || false);
  await User.updateOne({ _id: user._id }, { $set: { bookMarked: user.bookMarked } });

  res.json({ status: user.bookMarked });
};
