require('../../logger');
const Room = require('../../src/models/Room');

let fun = async () => {
  const rooms = await Room.find({ steamIds: '76561199032320086' });

  for (const room of rooms) {
    for (const steamId of room.steamIds) {
      if (!room.counters) continue;
      if (room.counters.get(steamId) > 0) {
        console.log(room._id);
        room.counters.set(steamId, 0);
        await Room.updateMany({ _id: room._id }, { $set: { counters: room.counters } });
      }
    }
  }
  console.log('done');
};

fun();
