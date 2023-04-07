const Item = require('../../models/BotSteamItem');
const getNameAndTag = require('../../helpers/getNameAndTag');
const config = require('../../../config');

module.exports = async function getBotsInventory(req, res) {
  const assetid = req.body.assetid;
  let fee = config.fee;
  if (req.user.subscriber) {
    fee = 1.18;
  }
  if (req.headers['fee-key'] === config.tg.feeKey) {
    fee = 1;
  }
  const item = await Item.findOne({ assetid }).lean().exec();

  if (item.price && item.price.steam) {
    let stikersPrice = Math.round((item.price.steam.converted - item.price.steam.base) * 100);
    const skinPrice = Math.round(item.price.steam.base * fee * 100);
    if (req.user.subscriber) {
      stikersPrice *= 0.93;
    }
    if (item.name.indexOf('Souvenir') !== -1) {
      item.price.steam.mean = skinPrice;
      item.price.steam.safe = skinPrice;
    } else {
      item.price.steam.mean = skinPrice + stikersPrice;
      item.price.steam.safe = skinPrice + stikersPrice;
    }
    item.price.steam.base = skinPrice;
    item.price.steam.converted = skinPrice + stikersPrice;

    item.ExteriorMin = getNameAndTag(item).tag;
    item.userSteamId = item.steamid;

    if (item.tradable) {
      item.tradeBan = null;
    }

    for (let i = 0; i < item.stickers.length; i++) {
      item.stickers[i].name = item.stickers[i].name.replace('Sticker | ', '');
      item.stickers[i].img = item.stickerPics[i];
      if (item.name.indexOf('Souvenir') !== -1) {
        item.stickers[i].price = 0;
      }
      if (req.user.subscriber) {
        item.stickers[i].price *= 0.93;
      }
      if (item.stickers[i].price === 0) {
        item.stickers[i].price = null;
      }
    }

    item.fullName = item.name;
  }

  res.json({
    status: 'success',
    result: item,
  });
};
