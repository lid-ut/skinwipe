const User = require('../../../models/User');
const BotSteam = require('../../../models/BotSteam');
const MarketTrade = require('../../../models/MarketTrade');
const MarketItem = require('../../../models/MarketItem');
const generateUnicCode = require('../../../helpers/generateUnicCode');
const sendPushV3 = require('../../../helpers/sendPushV3');
const i18n = require('../../../languages');
const getNameAndTag = require('../../../helpers/getNameAndTag');

module.exports = async (user, items, type = 'user', virtual, send) => {
  if (items.length === 0) {
    return null;
  }
  let partner;
  let timeCreated;
  let code;
  if (type === 'user') {
    partner = await User.findOne({ steamId: items[0].steamid });
    timeCreated = new Date(user.timecreated || Date.now());
    code = generateUnicCode.timecreated(timeCreated);
  } else {
    partner = await BotSteam.findOne({ steamid: items[0].steamid });
    timeCreated = partner.register;
    code = `${timeCreated}_${generateUnicCode.get()}`;
  }

  const trade = new MarketTrade({
    code,
    type,
    virtual,
    send,
    direction: 'out',
    status: virtual ? 'done' : 'wait',
    buyer: user.steamId,
    sellerDateCreate: partner.timecreated * 1000,
    seller: partner.steamId || partner.steamid,
    tradeUrl: partner.tradeUrl,
    items: [],
    itemsPartner: items,
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    let update = {
      $set: {
        reserver: user.steamId,
        virtual: send ? true : virtual,
        withdrawn: send,
      },
    };

    if (item.userAttempts.indexOf(user.steamId) === -1) {
      update = {
        $set: update.$set,
        $push: {
          userAttempts: user.steamId,
        },
      };
    }
    // eslint-disable-next-line no-await-in-loop
    await MarketItem.updateOne(
      {
        _id: item._id,
      },
      update,
    );
  }

  const skin = items[0];
  const sum = skin.price.steam.mean;

  if (type === 'user') {
    const data = {
      type: 'INFO',
      title: i18n((partner.locale || 'en').toLowerCase())
        .market.acceptSteam.title.replace('{skinname}', `${getNameAndTag(skin).name} (${getNameAndTag(skin).tag})`)
        .replace('{price}', Math.floor(sum) / 100),
      content: i18n((partner.locale || 'en').toLowerCase()).market.acceptSteam.content,
    };
    await sendPushV3(partner, data);
  }
  await trade.save();
  return trade;
};
