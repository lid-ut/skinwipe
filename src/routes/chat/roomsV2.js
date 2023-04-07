const Room = require('../../models/Room');
const logFinish = require('../../helpers/logFinish');
const getPremiumRoom = require('../../helpers/getPremiumRoom');
const getSupportRoom = require('../../helpers/getSupportRoom').getSupportRoom;

module.exports = async function process(req, res) {
  // eslint-disable-next-line no-undef
  if (redisClient && redisGet) {
    // eslint-disable-next-line no-undef
    const result = await redisGet(req.redisToken);
    if (result) {
      res.json(result);
      return;
    }
  }

  const offset = parseInt(req.params.offset, 10);
  const limit = parseInt(req.params.limit, 10);

  const roomsDB = await Room.find({
    steamIds: { $in: [req.user.steamId] },
    removed: { $ne: req.user.steamId },
  })
    .populate('users')
    .sort({ 'lastMessage.createdAt': -1 })
    .skip(offset)
    .limit(limit);

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
      if (!partner.blacklist) {
        partner.blacklist = [];
      }
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
        heBlackListedMe: partner.blacklist.indexOf(req.user.steamId) > -1,
      };
    })
    .filter(r => r !== null);

  if (offset === 0) {
    if (req.user.subscriber || req.appVersion === 'w1.0.1' || parseInt(req.appVersion, 10) >= 153) {
      const supportRoom = await getSupportRoom(req.user);
      rooms.unshift(supportRoom.room);
    }

    const premiumRoom = await getPremiumRoom(req.user);
    rooms.unshift(premiumRoom.room);
  }

  if (redisClient) {
    redisClient.setex(req.redisToken, 3, JSON.stringify({ status: 'success', result: rooms }));
  }

  res.json({ status: 'success', result: rooms });
};
