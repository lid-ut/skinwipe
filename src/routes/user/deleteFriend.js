const User = require('../../models/User');

module.exports = async function deleteFriend(req, res) {
  const partner = await User.findOne({ steamId: req.body.steamId });
  if (!partner) {
    res.json({ status: 'error', message: 'partner not found' });
    return;
  }

  if (!req.user.friends) {
    req.user.friends = [];
  }

  if (req.user.friends.indexOf(req.body.steamId) > -1) {
    req.user.friends = req.user.friends.filter(sid => sid !== req.body.steamId);
    await User.updateOne(
      { _id: req.user._id },
      {
        $set: { friends: req.user.friends },
      },
    );
  }

  res.json({ status: 'success', friend: false });
};
