const User = require('../../models/User');
const Room = require('../../models/Room');

module.exports = async function process(req, res) {
  const partner = await User.findOne({ steamId: req.params.steamId });
  if (!partner) {
    res.json({ status: 'error', message: 'partner not found' });
    return;
  }
  const oldRoom = await Room.findOne({ steamIds: { $all: [req.params.steamId, req.user.steamId] } }).populate('users');
  if (oldRoom) {
    const result = {
      status: 'success',
      roomName: oldRoom.name,
      room: {
        name: oldRoom.name,
        createdAt: oldRoom.createdAt,
        updatedAt: oldRoom.updatedAt,
        abuser: partner.abuser || false,
        chatBanned: partner.chatBanned || false,
        bookMarked: partner.bookMarked || false,
        banned: partner.banned || false,
        userName: partner.personaname || '',
        avatar: partner.avatarfull || '',
        steamId: partner.steamId || '',
        allSkinsCount: partner.allSkinsCount || 0,
        subscriber: partner.subscriber || false,
        tradeUrl: partner.tradeUrl || '',
        newMessages: oldRoom.get(`counters.${req.user.steamId}`) || 0,
        blackListed: (req.user.blacklist || []).indexOf(partner.steamId) > -1,
        heBlackListedMe: (partner.blacklist || []).indexOf(req.user.steamId) > -1,
      },
    };
    if (oldRoom.lastMessage) {
      result.room.lastMessage = {
        message: oldRoom.lastMessage.message,
        room: oldRoom.lastMessage.room,
        steamId: oldRoom.lastMessage.steamId,
        type: oldRoom.lastMessage.type,
        userName: oldRoom.lastMessage.userName || '',
        avatar: oldRoom.lastMessage.avatar || '',
        date: oldRoom.lastMessage.createdAt,
      };
    }
    res.json(result);
    return;
  }
  const roomName = `${req.user.steamId}_${req.params.steamId}`;

  const newRoom = new Room({
    name: roomName,
    users: [req.user, partner],
    removed: [],
    steamIds: [req.user.steamId, req.params.steamId],
  });
  await newRoom.save();

  // const roomResult = {
  //   message: `new room: ${roomName}`,
  //   abuser: req.user.abuser || false,
  //   chatBanned: req.user.chatBanned || false,
  //   bookMarked: req.user.bookMarked || false,
  //   banned: req.user.banned || false,
  //   room: roomName,
  //   steamId: req.user.steamId,
  //   userName: req.user.personaname,
  //   avatar: req.user.avatarfull,
  //   date: Date.now(),
  // };
  // todo:
  // if (server.sockets.in(steamId)) {
  //   server.sockets.in(steamId).emit('newRoom', roomResult);
  // }

  const result = {
    status: 'success',
    roomName,
    room: {
      name: newRoom.name,
      abuser: partner.abuser || false,
      chatBanned: partner.chatBanned || false,
      bookMarked: partner.bookMarked || false,
      banned: partner.banned || false,
      createdAt: newRoom.createdAt,
      updatedAt: newRoom.updatedAt,
      userName: partner.personaname || '',
      avatar: partner.avatarfull || '',
      steamId: partner.steamId || '',
      allSkinsCount: partner.allSkinsCount || 0,
      subscriber: partner.subscriber || false,
      tradeUrl: partner.tradeUrl || '',
      newMessages: 0,
      blackListed: (req.user.blacklist || []).indexOf(partner.steamId) > -1,
      heBlackListedMe: (partner.blacklist || []).indexOf(req.user.steamId) > -1,
    },
  };

  res.json(result);
};
