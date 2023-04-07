module.exports = async user => {
  return {
    personaname: user.personaname,
    steamId: user.steamId,
    avatar: user.avatarfull,
    avatarmedium: user.avatarfull,
    subscriber: user.subscriber,
    tradeUrl: user.tradeUrl,
    isFriend: user.isFriend,
    reviews: user.reviews,
    bans: user.bans,
    allSkinsCount: user.allSkinsCount,
  };
};
