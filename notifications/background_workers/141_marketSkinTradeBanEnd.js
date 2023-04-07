const BotSteamItem = require('../../src/models/BotSteamItem');
const User = require('../../src/models/User');

const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = new Date();

  const items = await BotSteamItem.find({
    buyer: { $ne: null },
    tradeBan: { $lte: startTime },
    virtual: true,
    pushSent: { $ne: true },
  })
    .limit(100)
    .lean()
    .exec();

  const users = await User.find({ steamId: { $in: items.map(it => it.buyer) } });

  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    const user = users.filter(it => it.steamId === item.buyer)[0];
    // eslint-disable-next-line no-await-in-loop
    await sendPushV3(user, {
      type: 'INFO',
      // steamId: item.buyer,
      // assetId: item.assetid,
      title: i18n((user.locale || 'en').toLowerCase()).tradeBanEnd.skin,
      content: item.name,
    });
  }
  await BotSteamItem.updateMany({ _id: { $in: items.map(it => it._id) } }, { $set: { pushSent: true } });
  logger.info(`[141_marketSkinTradeBanEnd] end in ${Date.now() - startTime}ms`);
  callback();
};
