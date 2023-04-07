const Room = require('../../models/Room');

module.exports = async function process(req, res) {
  let newMessages = 0;
  const rooms = await Room.find({ steamIds: { $in: [req.user.steamId] }, counters: { $ne: null } }, { name: 1, counters: 1 }).lean();
  const roomsMessages = {};
  for (let i = 0; i < rooms.length; i++) {
    newMessages += rooms[i].counters[req.user.steamId] || 0;
    roomsMessages[rooms[i].name] = rooms[i].counters[req.user.steamId] || 0;
  }
  res.json({ status: 'success', newMessages, rooms: roomsMessages });
};
