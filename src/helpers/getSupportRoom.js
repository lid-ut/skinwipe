const Message = require('../models/Message');
const User = require('../models/User');

module.exports.getSupportRoom = async function getSupportRoom(user) {
  const roomName = `support_${user.steamId}`;
  let steamId = '1';
  // let avatar = 'https://skinswipe.gg/img/chats/general.jpg';
  let avatar = 'https://skinswipe.gg/img/chats/coin.png';
  let userName = 'Premium Support';
  if (user.locale && user.locale === 'ru') {
    userName = 'Премиум Поддержка';
  }
  if (parseInt(user.steamId.replace(/[\D]/g, ''), 10) < 100) {
    steamId = user.steamId;
    avatar = user.avatarfull;
    userName = user.personaname;
  }
  let lastMessage = {
    message: '',
    room: roomName,
    steamId,
    type: 'message',
    userName: 'Support',
    avatar,
    allSkinsCount: 0,
    subscriber: false,
    tradeUrl: '',
    date: new Date(),
  };
  const lastMessages = await Message.find({ room: roomName })
    .sort({ _id: -1 })
    .limit(1);
  if (lastMessages && lastMessages.length) {
    lastMessage = {
      message: lastMessages[0].message,
      room: roomName,
      steamId: lastMessages[0].steamId,
      type: lastMessages[0].type,
      userName: lastMessages[0].userName,
      avatar: lastMessages[0].avatar,
      allSkinsCount: 0,
      subscriber: false,
      tradeUrl: '',
      date: lastMessages[0].createdAt,
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

module.exports.newSupportRoom = async function newSupportRoom(searchString) {
  const user = await User.findOne({ $or: [{ steamId: searchString }, { personaname: searchString }] });
  if (!user) {
    return null;
  }

  return {
    name: `support_${user.steamId}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    subscriber: user.subscriber,
    abuser: user.abuser,
    chatBanned: user.chatBanned,
    banned: user.banned,
    bookMarked: user.bookMarked,
    userName: user.personaname,
    locale: user.locale,
    email: user.email,
    avatar: user.avatarfull,
    traderRating: user.traderRating,
    mobileActiveDates: user.mobileActiveDates,
    devices: user.devices,
    firebaseTokens: [],
    lastSteamItemsUpdate: user.lastSteamItemsUpdate,
    haveTradeHistory: user.haveTradeHistory,
    realname: user.realname,
    steamId: user.steamId,
    allSkinsCount: user.allSkinsCount,
    allSkinsPrice: user.allSkinsPrice,
    coinCount: user.coinCount,
    friendPoints: user.mySkinInvitationPoints || 0,
    stats: user.stats,
    profileurl: user.profileurl,
    tradeUrl: user.tradeUrl,
  };
};
