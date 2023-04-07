const Message = require('../../models/Message');

module.exports = async function process(req, res) {
  const rooms = [];
  const messages = await Message.find({
    room: /support_/i,
    supportResolved: { $ne: true },
    steamId: { $nin: [null, '2'] },
    createdAt: { $gte: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
  })
    .sort({ createdAt: -1 })
    .populate('user')
    .lean();

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const oldRoom = rooms.find(r => r.name === message.room);
    if (!oldRoom && message.user) {
      const user = message.user;
      rooms.push({
        name: message.room,
        lastMessage: message,
        ip: user.ipAddress,
        createdAt: user.createdAt,
        updatedAt: message.updatedAt,
        subscriber: user.subscriber,
        abuser: user.abuser,
        chatBanned: user.chatBanned,
        bookMarked: user.bookMarked,
        banned: user.banned,
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
        steamId: message.steamId,
        allSkinsCount: user.allSkinsCount,
        allSkinsPrice: user.allSkinsPrice,
        coinCount: user.coinCount,
        friendPoints: user.mySkinInvitationPoints || 0,
        stats: user.stats,
        profileurl: user.profileurl,
        tradeUrl: user.tradeUrl,
      });
    }
  }

  if (redisClient) {
    redisClient.setex(req.redisToken, 20, JSON.stringify({ status: 'success', rooms }));
  }
  res.json({ status: 'success', rooms });
};
