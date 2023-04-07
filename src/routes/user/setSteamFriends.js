const User = require('../../models/User');

module.exports = async function setSteamFriends(req, res) {
  if (req.body.steamIds.length > 0) {
    await User.updateOne({ steamId: req.user.steamId }, { $set: { steamFriends: req.body.steamIds } });
  }
  res.json({ status: 'success' });
};
