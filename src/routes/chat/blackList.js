const Room = require('../../models/Room');

module.exports = async function process(req, res) {
  const roomsDB = await Room.find({
    $and: [
      {
        steamIds: req.user.steamId,
      },
      {
        steamIds: { $in: req.user.blacklist || [] },
      },
    ],
  })
    .populate('users')
    .sort({ 'lastMessage.createdAt': -1 });

  const rooms = roomsDB
    .map(r => {
      const partner = r.users.find(u => u.steamId !== req.user.steamId);
      if (!partner) {
        return null;
      }

      let lastMessage = {
        message: '',
        room: r.name,
        steamId: partner.steamId,
        type: 'message',
        userName: partner.personaname || '',
        avatar: partner.avatarfull || '',
        allSkinsCount: partner.allSkinsCount || 0,
        subscriber: partner.subscriber || false,
        tradeUrl: partner.tradeUrl || '',
        date: r.createdAt,
      };
      if (r.lastMessage) {
        const user = r.users.find(u => u.steamId === r.lastMessage.steamId) || partner;
        lastMessage = {
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
      }
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
