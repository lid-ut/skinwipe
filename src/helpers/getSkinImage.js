const ItemImage = require('../models/ItemImage');
const ItemWithStickerImage = require('../models/ItemWithStickerImage');
const StickersOnItemQueue = require('../models/StickersOnItemQueue');
const { Statuses } = require('../models/StickersOnItemQueue');

module.exports = async (steamId, appId, name, stickers) => {
  if (appId !== 730) {
    return null;
  }
  name = name
    .replace(/^StatTrak™/, '')
    .trim()
    .replace(/ \(.+\)$/, '');
  const itemImage = await ItemImage.findOne({ name });
  if (!itemImage) {
    return null;
  }

  if (!stickers || !stickers.length) {
    return `/${itemImage.imageUrl}`;
  }

  const imageWithSticker = await ItemWithStickerImage.findOne({ name, steamId });
  if (imageWithSticker) {
    return imageWithSticker.imageUrl;
  }

  let itemInQueue = await StickersOnItemQueue.findOne({
    status: { $ne: Statuses.failed },
    name,
    stickers,
    steamId,
  });

  if (!itemInQueue) {
    itemInQueue = new StickersOnItemQueue({
      status: Statuses.new,
      name,
      stickers,
      steamId,
    });
    await itemInQueue.save();
  }
  return null;
};
