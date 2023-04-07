const User = require('../../models/User');
const { affiliatedUsers } = require('../../helpers/leaderList');

const getUserPlace = async user => {
  if (!user.topPoints) {
    user.topPoints = 0;
  }
  if (user.topPoints === 0) {
    return 0;
  }
  if (affiliatedUsers.indexOf(user.steamId) > -1) {
    return 0;
  }
  const place = await User.countDocuments({ topPoints: { $gt: user.topPoints }, steamId: { $nin: affiliatedUsers } });
  return place + 1;
};

module.exports = async function process(req) {
  let users = await User.find(
    {
      topPoints: { $ne: null, $gt: 0 },
      steamId: { $nin: affiliatedUsers },
    },
    {
      personaname: 1,
      steamId: 1,
      avatar: 1,
      avatarfull: 1,
      topPoints: 1,
    },
  )
    .sort({ topPoints: -1 })
    .skip(req.params.offset)
    .limit(req.params.limit)
    .lean();
  users = users.map((user, i) => {
    return {
      ...user,
      place: req.query.offset + i + 1,
      topPoints: Math.floor(user.topPoints || 0),
    };
  });
  return {
    status: 'success',
    users,
    place: await getUserPlace(req.user),
    topPoints: Math.floor(req.user.topPoints || 0),
  };
};
