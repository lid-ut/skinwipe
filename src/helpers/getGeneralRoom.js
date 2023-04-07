const Message = require('../models/Message');

module.exports = async function getGeneralRoom(user) {
  let generalName = 'General chat';
  const steamId = '1';
  const avatar = 'https://skinswipe.gg/img/chats/general.jpg';
  if (user.locale && user.locale === 'ru') {
    generalName = 'Общий чат';
  }
  let lastMessage = {
    message: '',
    room: 'general',
    steamId,
    type: 'message',
    userName: 'General',
    avatar,
    allSkinsCount: 0,
    subscriber: false,
    tradeUrl: '',
    date: new Date(),
  };
  const lastGeneralMessages = await Message.find({ room: 'general' })
    .sort({ _id: -1 })
    .limit(1);
  if (lastGeneralMessages && lastGeneralMessages.length) {
    const lastGeneralMessage = lastGeneralMessages[0];
    lastMessage = {
      message: lastGeneralMessage.message,
      room: 'general',
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
    name: 'general',
    createdAt: new Date(),
    updatedAt: new Date(),
    sticky: true,
    userName: generalName,
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
