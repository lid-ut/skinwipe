const Room = require('../../models/Room');

module.exports = async function process(req, res) {
  const roomsDB = await Room.find({
    steamIds: req.user.steamId,
    removed: req.user.steamId,
  })
    .populate('users')
    .sort({ 'lastMessage.createdAt': -1 });

  const rooms = roomsDB
    .map(r => {
      const partner = r.users.filter(u => u.steamId !== req.user.steamId)[0];
      if (!partner) {
        return null;
      }
      if (!r.lastMessage) {
        return null;
      }
      const user = r.users.filter(u => u.steamId === r.lastMessage.steamId)[0];
      if (!user) {
        return null;
      }
      // if (partner.blacklist && partner.blacklist.indexOf(client.steamId) > -1) {
      //   return null;
      // }
      if (req.user.blacklist && req.user.blacklist.indexOf(partner.steamId) > -1) {
        return null;
      }
      const lastMessage = {
        message: r.lastMessage.message,
        room: r.lastMessage.room,
        steamId: r.lastMessage.steamId,
        type: r.lastMessage.type,
        userName: user.personaname || '',
        avatar: user.avatarfull || '',
        allSkinsCount: user.allSkinsCount || 0,
        subscriber: user.subscriber || false,
        tradeUrl: user.tradeUrl || '',
        date: r.lastMessage.createdAt,
      };
      return {
        name: r.name,
        abuser: partner.abuser || false,
        chatBanned: partner.chatBanned || false,
        bookMarked: partner.bookMarked || false,
        banned: partner.banned || false,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        userName: partner.personaname || '',
        avatar: partner.avatarfull || '',
        steamId: partner.steamId || '',
        allSkinsCount: partner.allSkinsCount || 0,
        subscriber: partner.subscriber || false,
        tradeUrl: partner.tradeUrl || '',
        lastMessage,
        newMessages: r.get(`counters.${req.user.steamId}`) || 0,
      };
    })
    .filter(r => r !== null);

  res.json({ status: 'success', rooms });
};
