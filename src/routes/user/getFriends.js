const User = require('../../models/User');
const UserSteamItems = require('../../models/UserSteamItems');

function top10Items(userItems) {
  let items = [];

  if (userItems) {
    for (let i = 0; i < userItems.length; i++) {
      if (userItems[i] && userItems[i].steamItems) {
        items = [...items, ...userItems[i].steamItems];
      }
    }
  }

  items.sort((b, a) => {
    if (!a.price || !b.price) {
      return 0;
    }
    if (a.price.steam.safe > b.price.steam.safe) {
      return 1;
    }
    return -1;
  });

  items = items.filter(item => {
    return !!item.price;
  });

  items = items.slice(0, 10);
  return items;
}

function getUserInfo(user, userItems, allMySkinsCountForTrade, curUserFriends) {
  let online = 0; // offline
  if (user.lastActiveDate > new Date(Date.now() - 10 * 60 * 1000)) {
    online = 1; // online
  } else if (user.lastActiveDate > new Date(Date.now() - 60 * 60 * 1000)) {
    online = 2; // idle
  }
  return {
    steamId: user.steamId,
    statusMessage: user.subscriber && !user.chatBanned ? user.statusMessage || '' : '',
    allSkinsCount: user.allSkinsCount,
    giveSkinCount: user.allSkinsCount,
    personaname: user.personaname,
    allMySkinsCountForTrade,
    bans: user.bans,
    avatar: user.avatarfull,
    online,
    isFriend: !!curUserFriends.find(sid => sid === user.steamId),
    subscriber: user.subscriber,
    top10Items: top10Items(userItems),
  };
}

module.exports = async function getFriends(req, res) {
  let friendIds = req.user.friends || [];
  if (req.params && req.params.steamId) {
    const user = await User.findOne({ steamId: req.params.steamId }, { friends: 1 });
    friendIds = user.friends || [];
  }
  if (typeof req.query.offset === 'undefined' || typeof req.query.limit === 'undefined') {
    res.json({ status: 'error' });
  }
  const offset = parseInt(req.query.offset, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 10;

  // console.log('friends (common):', typeof req.query.common, req.query.common);
  if (req.query.common) {
    friendIds = friendIds.filter(sid => (req.user.friends || []).find(fsid => fsid === sid));
  }
  const partnersQuery = {};
  if (req.query.name && req.query.name.length) {
    partnersQuery.personaname = { $regex: req.query.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), $options: 'i' };
  } else {
    friendIds = friendIds.slice(offset, offset + limit);
  }
  partnersQuery.steamId = { $in: friendIds || [] };

  let partners = await User.find(partnersQuery)
    .sort({ personaname: 1 })
    .lean()
    .exec();
  const partnerItems = await UserSteamItems.find({ steamId: { $in: friendIds } })
    .sort({ _id: 1 })
    .lean();

  if (req.query.name && req.query.name.length) {
    partners = partners.slice(offset, offset + limit);
  }

  const friends = [];
  partners.forEach(p => {
    if (!p || !p.steamId) {
      return;
    }
    const userItems = partnerItems.filter(inv => inv.steamId === p.steamId);
    friends.push(getUserInfo(p, userItems, req.user.allSkinsCount, req.user.friends || []));
  });

  res.json({ status: 'success', friends });
};
