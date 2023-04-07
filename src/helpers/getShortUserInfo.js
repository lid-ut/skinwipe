module.exports = function getShortUserInfo(user) {
  return {
    personaname: user.personaname,
    steamId: user.steamId,
    avatar: user.avatarfull,
    avatarmedium: user.avatarfull,
    subscriber: user.subscriber,
    tradeUrl: user.tradeUrl,
    isFriend: user.isFriend,
    reviews: user.reviews || {
      avg: 0,
      count: 0,
      hasReviewed: false,
    },
    bans: user.bans,
    allSkinsCount: user.allSkinsCount,
  };
};
