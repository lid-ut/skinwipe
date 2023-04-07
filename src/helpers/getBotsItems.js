const BotSteamItem = require('../models/BotSteamItem');
const getNameAndTag = require('./getNameAndTag');

module.exports = async (user, botItems, fee) => {
  return (
    await BotSteamItem.find({
      assetid: { $in: (botItems || []).map(it => it.assetid) },
    })
  ).map(it => {
    let stikersPrice = Math.round((it.price.steam.converted - it.price.steam.base) * 100);
    const skinPrice = Math.round(it.price.steam.base * fee * 100);
    if (user.subscriber) {
      stikersPrice *= 0.93;
    }
    if (it.name.indexOf('Souvenir') !== -1) {
      it.price.steam.mean = skinPrice;
      it.price.steam.safe = skinPrice;
    } else {
      it.price.steam.mean = skinPrice + stikersPrice;
      it.price.steam.safe = skinPrice + stikersPrice;
    }
    const nameTag = getNameAndTag(it);
    it.ExteriorMin = nameTag.tag;
    it.price.steam.base = skinPrice + stikersPrice;
    it.price.steam.converted = skinPrice + stikersPrice;

    for (let i = 0; i < it.stickers.length; i++) {
      it.stickers[i].img = it.stickerPics[i];
      if (it.name.indexOf('Souvenir') !== -1) {
        it.stickers[i].price = 0;
      }
      if (user.subscriber) {
        it.stickers[i].price *= 0.93;
      }
      if (it.stickers[i].price === 0) {
        it.stickers[i].price = null;
      }
    }

    return it;
  });
};
