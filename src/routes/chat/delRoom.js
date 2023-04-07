const Room = require('../../models/Room');

module.exports = async function process(req, res) {
  const r = await Room.findOne({ name: req.params.roomName, steamIds: req.user.steamId });
  if (!r) {
    res.json({ status: 'error', message: 'No such room' });
    return;
  }

  if (!r.counters) {
    r.counters = [];
  }
  r.counters[req.user.steamId] = 0;

  if (!r.removed) {
    r.removed = [];
  }
  r.removed.push(req.user.steamId);
  await r.save();
  res.json({ status: 'success' });
};
