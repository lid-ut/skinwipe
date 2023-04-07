const User = require('../../models/User');
const Jail = require('../../models/Jail');

module.exports = async function process(req, res) {
  if (!req.params || !req.params.steamId || !req.params.hours) {
    logger.warn(`[ban] error (data)`);
    return;
  }

  const user = await User.findOne({ steamId: req.params.steamId });
  if (!user) {
    logger.warn(`[ban] cannot find user`);
    res.json({ status: false });
    return;
  }

  user.chatBanned = !(user.chatBanned || false);
  await User.updateOne({ _id: user._id }, { $set: { chatBanned: user.chatBanned } });

  const expiration = new Date(Date.now() + parseInt(req.params.hours, 10) * 60 * 60 * 1000);
  if (user.chatBanned) {
    await new Jail({
      steamId: user.steamId,
      type: 'mute',
      expiration,
    }).save();
  } else {
    await Jail.deleteMany({
      steamId: user.steamId,
      type: 'mute',
    });
  }

  res.json({ status: user.chatBanned });
};
