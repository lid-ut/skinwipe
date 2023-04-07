const User = require('../../models/User');

module.exports = async function process(req, res) {
  if (!req.params || !req.params.steamId) {
    logger.warn(`[globalBan] error (data)`);
    return;
  }

  const user = await User.findOne({ steamId: req.params.steamId });
  if (!user) {
    logger.warn(`[globalBan] cannot find user`);
    res.json({ status: false });
    return;
  }

  user.banned = !(user.banned || false);
  await User.updateOne({ _id: user._id }, { $set: { banned: user.banned } });

  // if (server.sockets.in('admin')) {
  //   server.sockets.in('admin').emit('globalBan', {
  //     steamId: data.steamId,
  //     value: user.banned,
  //   });
  // }

  res.json({ status: user.banned });
};
