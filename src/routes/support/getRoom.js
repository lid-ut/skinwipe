const User = require('../../models/User');

async function newSupportRoom(searchString) {
  const user = await User.findOne({ $or: [{ steamId: searchString }, { personaname: searchString }] });
  if (!user) {
    return null;
  }

  return {
    name: `support_${user.steamId}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    subscriber: user.subscriber,
    abuser: user.abuser,
    chatBanned: user.chatBanned,
    banned: user.banned,
    bookMarked: user.bookMarked,
    userName: user.personaname,
    locale: user.locale,
    email: user.email,
    avatar: user.avatarfull,
    traderRating: user.traderRating,
    mobileActiveDates: user.mobileActiveDates,
    devices: user.devices,
    firebaseTokens: [],
    lastSteamItemsUpdate: user.lastSteamItemsUpdate,
    haveTradeHistory: user.haveTradeHistory,
    realname: user.realname,
    steamId: user.steamId,
    allSkinsCount: user.allSkinsCount,
    allSkinsPrice: user.allSkinsPrice,
    coinCount: user.coinCount,
    friendPoints: user.mySkinInvitationPoints || 0,
    stats: user.stats,
    profileurl: user.profileurl,
    tradeUrl: user.tradeUrl,
  };
}

module.exports = async function process(req, res) {
  const supportRoom = await newSupportRoom(req.params.roomName.replace('support_', ''));
  res.json({ status: 'success', room: supportRoom });
};
