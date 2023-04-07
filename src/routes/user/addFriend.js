const User = require('../../models/User');

const reportQuest = require('../../helpers/reportQuest');

module.exports = async function addFriend(req) {
  const partner = await User.findOne({ steamId: req.body.steamId });
  if (!partner) {
    return { status: 'error', code: 0, message: 'partner not found' };
  }

  if (!req.user.friends) {
    req.user.friends = [];
  }

  if (req.user.friends.indexOf(req.body.steamId) === -1) {
    if (req.user.steamId === req.body.steamId) {
      return { status: 'error', code: 1, message: 'self-friend' };
    }
    req.user.friends.push(req.body.steamId);
    await User.updateOne(
      { _id: req.user._id },
      {
        $set: { friends: req.user.friends },
      },
    );
  }

  await reportQuest(req.user, 'friend');
  return { status: 'success', friend: true };
};
