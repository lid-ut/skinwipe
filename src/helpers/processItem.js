const getNameAndTag = require('./getNameAndTag');

module.exports = async function processItem(item) {
  let image = '';
  if (item.image) {
    image = item.image;
  }
  if (item.image_large) {
    image = item.image_large;
  }
  if (item.image_small) {
    image = item.image_small;
  }
  const nameTag = getNameAndTag(item);
  if (item.float && !item.paintWear) {
    item.paintWear = item.float;
  }
  return {
    name: nameTag.name,
    ExteriorMin: nameTag.tag,

    image_small: image.replace('https://steamcommunity-a.akamaihd.net/economy/image/', ''),
    image_large: image.replace('https://steamcommunity-a.akamaihd.net/economy/image/', ''),
    userSteamId: item.userSteamId || '', // Какому юзеру принадлежит
    appid: parseInt(item.appid, 10) || 570,
    amount: 1, // Количество, для предметов имеющих данную величину
    assetid: item.assetid,
    classid: '0',
    contextid: `${item.contextid || 2}`,
    instanceid: '0',

    marketable: true, // 0 - нельзя продать, 1 - можно продать
    tradable: true, // Возможность передать предмет
    market_tradable_restriction: 0, // Дней бана после обмена

    Quality: item.Quality || item.quality_name, // CSGO, Dota2, TF2
    QualityName: item.QualityName || item.quality_type, // CSGO, Dota2, TF2
    QualityColor: item.QualityColor || item.border_color, // CSGO, Dota2
    Rarity: item.rarity || item.Rarity, // CSGO, Dota2
    RarityName: item.rarity || item.Rarity, // CSGO, Dota2
    RarityColor: item.rarity_color || item.RarityColor, // CSGO, Dota2
    Type: item.Type || 'no', // CSGO, Dota2, TF2
    Slot: item.Slot || 'no', // Dota2
    Hero: item.Hero || 'no', // Dota2
    Weapon: item.Weapon || 'no', // CSGO
    ItemSet: item.ItemSet || 'no', // CSGO
    ItemSetName: item.ItemSetName || 'no', // CSGO
    Exterior: item.Exterior,
    stickerPics: item.stickerPics || [], // CSGO
    stickerNames: item.stickerNames || [], // CSGO
    runePics: item.runePics || [], // DOTA
    runeNames: item.runeNames || [], // DOTA
    runeTypes: item.runeTypes || [], // DOTA
    nameTag: item.nameTag, // CSGO
    Class: item.Class, // TF2

    steamcat: item.steamcat,
    itemclass: item.itemclass,
    Game: item.Game,
    GameName: item.GameName,
    droprate: item.droprate,
    droprateName: item.droprateName,
    item_class: item.item_class,
    item_className: item.item_className,

    price: item.price || {
      steam: {
        mean: 0,
        safe: 0,
      },
    },
    paintWear: item.paintWear === 'wait...' || item.paintWear === 0 || item.paintWear === 'unavailable' ? null : parseFloat(item.paintWear),
  };
};
