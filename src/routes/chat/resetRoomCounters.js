const Room = require('../../models/Room');

module.exports = async function process(req, res) {
  const room = await Room.findOne({ name: req.params.roomName, steamIds: { $in: [req.user.steamId] } }).lean();
  if (!room) {
    res.json({ status: 'error', message: 'access denied' });
    return;
  }

  const $set = {};
  $set[`counters.${req.user.steamId}`] = 0;
  await Room.updateMany({ name: req.params.roomName }, { $set });

  let newMessages = 0;
  const rooms = await Room.find({ steamIds: { $in: [req.user.steamId] } });

  for (let i = 0; i < rooms.length; i++) {
    newMessages += rooms[i].get(`counters.${req.user.steamId}`) || 0;
  }

  res.json({ status: 'success', room: req.params.roomName, newMessages });
};
