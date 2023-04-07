require('../logger');
const Comment = require('../src/models/Comment');
const UserSteamItems = require('../src/models/UserSteamItems');
const getNameAndTag = require('../src/helpers/getNameAndTag');

async function resave(comment) {
  if (!comment) {
    return;
  }

  let entityPreview = {};
  if (comment.entityType === 'skin') {
    const inventory = await UserSteamItems.findOne({ 'steamItems.assetid': comment.entityId });
    if (!inventory || !inventory.steamItems) {
      await Comment.deleteOne({ _id: comment._id });
      logger.error('No inventory!');
      return;
    }
    const skin = inventory.steamItems.find(sk => sk.assetid === comment.entityId);
    if (skin.float === undefined || skin.float === 'wait...') {
      skin.float = null;
    }
    const nameTag = getNameAndTag(skin);
    entityPreview = {
      price: skin.price,
      assetid: skin.assetid,
      userSteamId: skin.userSteamId,
      appid: skin.appid,
      name: nameTag.name,
      ExteriorMin: nameTag.tag,
      image_small: skin.image_small,
      image_large: skin.image_large,
      stickerPics: skin.stickerPics || [], // CSGO
      stickerNames: skin.stickerNames || [], // CSGO
      runePics: skin.runePics || [], // DOTA
      runeNames: skin.runeNames || [], // DOTA
      runeTypes: skin.runeTypes || [], // DOTA
      paintWear: skin.float === null ? null : parseFloat(skin.float.substr(0, 10)),
      float: skin.float === null ? null : skin.float.substr(0, 10),
    };
  }
  if (!Object.keys(entityPreview).length) {
    logger.error('No keys!');
    return;
  }
  logger.info(Object.keys(entityPreview).length);
  await Comment.updateOne({ _id: comment._id }, { $set: { entityPreview } });
}

const startTime = Date.now();
Comment.find({ 'entityPreview.appid': null, entityType: 'skin' }).then(async comments => {
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    const percent = (i * 100) / comments.length;
    logger.info(
      `[resaveComments][comment][${Math.round(percent)}%][${i} / ${comments.length}] ${comment._id} in ${Date.now() - startTime} ms`,
    );
    await resave(comment);
  }
  logger.info('[resaveComments] Done!');
  process.exit(1);
});
