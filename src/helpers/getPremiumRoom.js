const Message = require('../models/Message');

module.exports = async function getPremiumRoom(user) {
  let userName = 'Premium chat';
  let roomName = 'premium';
  const premiumChats = ['pl', 'es', 'pt', 'ro', 'vi'];
  if (user.locale !== 'ru') {
    if (premiumChats.indexOf(user.locale) > -1) {
      roomName = `premium_${user.locale}`;
    } else {
      roomName = 'premium_eng';
    }
  }
  const steamId = '1';
  const avatar = 'https://skinswipe.gg/img/chats/coin.png';
  if (user.locale && user.locale === 'ru') {
    userName = 'Премиум чат';
  }
  let lastMessage = {
    message: '',
    room: roomName,
    steamId,
    type: 'message',
    userName: 'Premium',
    avatar,
    allSkinsCount: 0,
    subscriber: false,
    tradeUrl: '',
    date: new Date(),
  };
  const lastGeneralMessages = await Message.find({ room: roomName }).sort({ _id: -1 }).limit(1);
  if (lastGeneralMessages && lastGeneralMessages.length) {
    const lastGeneralMessage = lastGeneralMessages[0];
    lastMessage = {
      message: lastGeneralMessage.message,
      room: roomName,
      steamId: lastGeneralMessage.steamId,
      type: lastGeneralMessage.type,
      userName: lastGeneralMessage.userName,
      avatar: lastGeneralMessage.avatar,
      allSkinsCount: 0,
      subscriber: false,
      tradeUrl: '',
      date: lastGeneralMessage.createdAt,
    };
  }
  const room = {
    name: roomName,
    createdAt: new Date(),
    updatedAt: new Date(),
    sticky: true,
    userName,
    avatar,
    steamId,
    allSkinsCount: 0,
    subscriber: false,
    tradeUrl: '',
    lastMessage,
    newMessages: 0,
  };
  return { status: 'success', room };
};
