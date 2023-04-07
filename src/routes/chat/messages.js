const Room = require('../../models/Room');
const Message = require('../../models/Message');

const formatChatTrade = require('../../helpers/formatChatTrade');

const generalMessages = async (limit, offset) => {
  let messages = await Message.find({
    room: 'general',
  })
    .sort({
      _id: -1,
    })
    .skip(offset)
    .limit(limit)
    .lean();

  messages = messages.map(m => {
    return {
      message: m.message.toString(),
      room: m.room,
      steamId: m.steamId,
      userName: m.userName,
      avatar: m.avatar,
      type: m.type,
      date: m.createdAt,
    };
  });

  const messageCount = await Message.countDocuments({
    room: 'general',
  });
  return {
    status: 'success',
    messages,
    messageCount,
  };
};

const premiumMessages = async (locale, limit, offset) => {
  let premiumRoomName = 'premium';
  const premiumChats = ['pl', 'es', 'pt', 'ro', 'vi'];
  if (locale !== 'ru') {
    if (premiumChats.indexOf(locale) > -1) {
      premiumRoomName = `premium_${locale}`;
    } else {
      premiumRoomName = 'premium_eng';
    }
  }
  let messages = await Message.find({
    room: premiumRoomName,
  })
    .sort({
      _id: -1,
    })
    .skip(offset)
    .limit(limit)
    .lean();

  messages = messages.map(m => {
    return {
      message: m.message.toString(),
      room: m.room,
      steamId: m.steamId,
      userName: m.userName,
      avatar: m.avatar,
      type: m.type,
      date: m.createdAt,
    };
  });

  const messageCount = await Message.countDocuments({
    room: premiumRoomName,
  });
  return {
    status: 'success',
    messages,
    messageCount,
  };
};

const customRoomMessages = async (limit, offset, roomName) => {
  let messages = await Message.find({
    room: roomName,
  })
    .sort({
      _id: -1,
    })
    .skip(offset)
    .limit(limit)
    .lean();

  messages = messages.map(m => {
    return {
      message: m.message.toString(),
      room: m.room,
      steamId: m.steamId,
      userName: m.userName,
      avatar: m.avatar,
      type: m.type,
      date: m.createdAt,
    };
  });

  const messageCount = await Message.countDocuments({
    room: roomName,
  });
  return {
    status: 'success',
    messages,
    messageCount,
  };
};

module.exports = async function process(req) {
  const roomName = req.params.roomName || '';
  const limit = parseInt(req.params.limit || 10, 10);
  const offset = parseInt(req.params.offset || 0, 10);

  if (roomName === 'general') {
    return generalMessages(limit, offset);
  }

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
    return premiumMessages(req.user.locale, limit, offset);
  }

  if (roomName === `support_${req.user.steamId}`) {
    return customRoomMessages(limit, offset, roomName);
  }

  const room = await Room.findOne({
    steamIds: {
      $in: [req.user.steamId],
    },
    name: roomName,
  }).populate('users');

  if (!room) {
    return {
      status: 'error',
      message: 'access denied',
    };
  }

  room.set(`counters.${req.user.steamId}`, 0);
  await room.save();

  const partner = room.users.filter(user => user.steamId !== req.user.steamId)[0];
  if (!partner) {
    return {
      status: 'error',
      message: 'Partner not found',
    };
  }

  let messages = await Message.find({
    room: roomName,
  })
    .populate('trade')
    .sort({
      _id: -1,
    })
    .skip(offset)
    .limit(limit)
    .lean();

  messages = await Promise.all(
    messages.map(async m => {
      const mUser = room.users.filter(user => user.steamId === m.steamId)[0] || {
        personaname: m.userName,
        avatarfull: m.avatar,
        allSkinsCount: 0,
        tradeUrl: '',
        subscriber: false,
      };
      const t = {
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

      if (m.trade) {
        t.trade = await formatChatTrade(m.trade, req.user, partner);
      }
      return t;
    }),
  );

  const messageCount = await Message.countDocuments({
    room: roomName,
  });
  return {
    status: 'success',
    messages,
    messageCount,
  };
};
