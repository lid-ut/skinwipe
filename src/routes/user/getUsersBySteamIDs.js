const User = require('../../models/User');

module.exports = async function getUsersBySteamIDs(req) {
  const offset = parseInt(req.query.offset, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 10;

  let users = [];
  if (req.user.steamFriends && req.user.steamFriends.length) {
    const partners = await User.find({ steamId: { $in: req.user.steamFriends, $nin: req.user.friends } })
      .sort({ personaname: 1 })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();

    users = partners.map(p => {
      return {
        steamId: p.steamId,
        personaname: p.personaname,
        avatar: p.avatarfull,
        allSkinsCount: p.allSkinsCount,
      };
    });
  }

  return { status: 'success', result: users };
};
