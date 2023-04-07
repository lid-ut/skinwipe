const Message = require('../../models/Message');

module.exports = async function process(req, res) {
  const roomName = req.params.roomName || '';
  const limit = parseInt(req.params.limit || 10, 10);
  const offset = parseInt(req.params.offset || 0, 10);

  let messages = await Message.find({ room: roomName })
    .sort({ _id: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  messages = messages.map(m => {
    const mUser = {
      personaname: m.userName,
      avatarfull: m.avatar,
      allSkinsCount: 0,
      tradeUrl: '',
      subscriber: false,
    };
    return {
      message: (m.message || '').toString(),
      room: m.room,
      steamId: m.steamId,
      type: m.type,
      userName: mUser.personaname || '',
      avatar: mUser.avatarfull || '',
      allSkinsCount: mUser.allSkinsCount || 0,
      subscriber: mUser.subscriber || false,
      tradeUrl: mUser.tradeUrl || '',
      date: m.createdAt,
    };
  });

  res.json({ status: 'success', messages });
};
