const User = require('../../models/User');

module.exports = async function process(req, res) {
  if (!req.params || !req.params.steamId) {
    logger.warn(`[abuse] error (data)`);
    return;
  }

  const user = await User.findOne({ steamId: req.params.steamId });
  if (!user) {
    logger.warn(`[abuse] cannot find user`);
    res.json({ status: false });
    return;
  }

  user.abuser = !(user.abuser || false);
  await User.updateOne({ _id: user._id }, { $set: { abuser: user.abuser } });

  // if (server.sockets.in('admin')) {
  //   server.sockets.in('admin').emit('newAbuse', {
  //     steamId: data.steamId,
  //     value: user.chatBanned,
  //   });
  // }

  res.json({ status: user.abuser });
};
