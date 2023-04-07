const MarketItem = require('../../models/MarketItem');
const Settings = require('../../models/Settings');
const getNameAndTag = require('../../helpers/getNameAndTag');

module.exports = async (req, res) => {
  const it = await MarketItem.findOne({ assetid: req.params.assetid }).lean().exec();

  if (!it) {
    res.json({
      status: 'error',
      result: null,
    });
    return;
  }

  const settings = await Settings.findOne();

  if (it.price && it.price.steam) {
    it.ExteriorMin = getNameAndTag(it).tag;
    it.name = getNameAndTag(it).name;
    it.userSteamId = it.steamid;
    it.price.steam.sub = Math.round(it.price.steam.mean - (it.price.steam.mean / 100) * settings.market.discount);
    it.price.steam.mean = Math.round(it.price.steam.mean);
    it.price.steam.safe = Math.round(it.price.steam.safe);

    for (let i = 0; i < it.stickers.length; i++) {
      it.stickers[i].name = it.stickers[i].name.replace('Sticker | ', '');
      it.stickers[i].img = it.stickerPics[i];
    }

    it.fullName = it.name;
    if (it.float) {
      it.paintWear = parseFloat(it.float);
    }
  }

  res.json({
    status: 'success',
    result: it,
  });
};
