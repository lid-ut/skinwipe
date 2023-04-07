const Like = require('../../models/Like');
const Comment = require('../../models/Comment');
const UserSteamItems = require('../../models/UserSteamItems');
const User = require('../../models/User');
const getNameAndTag = require('../../helpers/getNameAndTag');
const UserStats = require('../../models/UsersStats');

module.exports = async (req, res) => {
  const inventory = await UserSteamItems.findOne(
    {
      steamId: req.params.steamId,
      'steamItems.assetid': req.params.assetId,
    },
    { steamId: 1, steamItems: { $elemMatch: { assetid: req.params.assetId } } },
  );
  if (!inventory) {
    res.json({ status: 'error', message: 'Inventory not found' });
    return;
  }
  const skin = inventory.steamItems[0];
  const likes = await Like.find({
    entityId: req.params.assetId,
    entityType: 'skin',
  }).lean();
  skin.likes = likes.length;
  skin.didILikeThis = likes.filter(l => l.steamId === req.user.steamId).length > 0;

  const comments = await Comment.find({
    entityId: req.params.assetId,
    entityType: 'skin',
  })
    .populate('user')
    .lean();
  skin.commentsCount = comments.length;
  skin.comments = (comments || []).map(com => {
    return {
      _id: com._id,
      date: com.createdAt,
      comment: com.comment,
      steamId: com.user.steamId,
      personaname: com.user.personaname,
      avatar: com.user.avatarfull,
      subscriber: com.user.subscriber,
    };
  });

  skin.blackListed = false;
  if (inventory.steamId === req.user.steamId) {
    skin.blackListed = !!(req.user.blackListedItems || []).find(bli => bli.assetid === req.params.assetId);
  }

  skin.amount = parseInt(skin.amount || 1, 10);
  if (skin.float === null || skin.float === undefined || skin.float === 'wait...') {
    skin.float = 'unavailable';
  }
  skin.paintWear = skin.float === 'unavailable' ? null : parseFloat(skin.float.substr(0, 10));
  skin.float = skin.float === 'unavailable' ? null : skin.float.substr(0, 10);
  const nameTag = getNameAndTag(skin);
  skin.steamLink = `https://steamcommunity.com/market/listings/${skin.appid}/${encodeURIComponent(skin.name.trim())}`;

  skin.ExteriorMin = nameTag.tag;
  skin.fullName = skin.name;
  const inventories = await UserSteamItems.find(
    {
      'steamItems.name': skin.name,
    },
    { steamId: 1 },
  ).limit(4);

  const users = await User.find(
    { steamId: { $in: inventories.map(it => it.steamId) } },
    {
      avatarmedium: 1,
      steamId: 1,
    },
  );

  const avatars = [];
  for (let i = 0; i < users.length; i++) {
    avatars.push(users[i].avatarmedium);
  }
  skin.name = nameTag.name;

  if (skin.stickers && skin.stickers.length > 0) {
    skin.stickers = skin.stickers.map(it => {
      it.name = it.name.replace('Sticker | ', '');
      return it;
    });
  }

  let userStats = await UserStats.findOne({ steamId: req.user.steamId });
  if (!userStats) {
    userStats = new UserStats({
      steamId: req.user.steamId,
      skinsWatched: [],
    });
  }
  userStats.skinsWatched.push(req.params.assetId);
  await userStats.save();

  await UserSteamItems.updateOne(
    {
      steamId: req.params.steamId,
      'steamItems.assetid': req.params.assetId,
    },
    {
      $inc: {
        'steamItems.$.viewCount': 1,
      },
    },
  );

  res.json({ status: 'success', result: { ...skin, avatars } });
};
