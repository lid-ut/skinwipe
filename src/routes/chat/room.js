const Room = require('../../models/Room');
const getGeneralRoom = require('../../helpers/getGeneralRoom');
const getPremiumRoom = require('../../helpers/getPremiumRoom');
const getSupportRoom = require('../../helpers/getSupportRoom').getSupportRoom;

module.exports = async function process(req, res) {
  const roomName = req.params.roomName;
  let premiumRoomName = 'premium';
  const premiumChats = ['pl', 'es', 'pt', 'ro', 'vi'];
  if (req.user.locale !== 'ru') {
    if (premiumChats.indexOf(req.user.locale) > -1) {
      premiumRoomName = `premium_${req.user.locale}`;
    } else {
      premiumRoomName = 'premium_eng';
    }
  }
  if (roomName === premiumRoomName) {
    const premiumRoom = await getPremiumRoom(req.user);
    res.json({ status: 'success', room: premiumRoom.room });
    return;
  }
  if (roomName === 'general') {
    const generalRoom = await getGeneralRoom(req.user);
    res.json({ status: 'success', room: generalRoom.room });
    return;
  }
  if (roomName === `support_${req.user.steamId}`) {
    const supportRoom = await getSupportRoom(req.user);
    res.json({ status: 'success', room: supportRoom.room });
    return;
  }

  const r = await Room.findOne({ name: roomName, steamIds: req.user.steamId }).populate('users');

  if (!r || !r.users) {
    res.json({ status: 'error', message: 'No users' });
    return;
  }
  const partner = r.users.filter(u => u.steamId !== req.user.steamId)[0];
  if (!partner) {
    res.json({ status: 'error', message: 'No partner' });
    return;
  }
  const room = {
    name: r.name,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    userName: partner.personaname || '',
    avatar: partner.avatarfull || '',
    steamId: partner.steamId || '',
    allSkinsCount: partner.allSkinsCount || 0,
    subscriber: partner.subscriber || false,
    tradeUrl: partner.tradeUrl || '',
    abuser: partner.abuser || false,
    newMessages: r.get(`counters.${req.user.steamId}`) || 0,
    blackListed: (req.user.blacklist || []).indexOf(partner.steamId) > -1,
    heBlackListedMe: (partner.blacklist || []).indexOf(req.user.steamId) > -1,
  };
  if (r.lastMessage) {
    const user = r.users.filter(u => u.steamId === r.lastMessage.steamId)[0];
    room.lastMessage = {
      message: r.lastMessage.message,
      room: r.lastMessage.room,
      steamId: r.lastMessage.steamId,
      type: r.lastMessage.type,
      userName: user.personaname || '',
      avatar: user.avatarfull || '',
      allSkinsCount: user.allSkinsCount || 0,
      subscriber: user.subscriber || false,
      abuser: user.abuser || false,
      tradeUrl: user.tradeUrl || '',
      date: r.lastMessage.createdAt,
    };
  }
  res.json({ status: 'success', room });
};
