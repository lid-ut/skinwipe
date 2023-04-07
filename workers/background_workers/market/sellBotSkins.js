const Bot = require('../../../src/models/BotSteam');
const Item = require('../../../src/models/BotSteamItem');
const Settings = require('../../../src/models/Settings');
const sellBot = require('../../../src/modules/market/items/sellBot');

const sellItem = async item => {
  const bot = await Bot.findOne({ steamid: item.steamid, canSell: true });
  if (!bot) {
    return;
  }

  bot.subscriber = true;
  await sellBot(bot, item, 'bot');
};

module.exports = async () => {
  const settings = await Settings.findOne();

  let findObj = {};
  if (!settings.market.server.virtual) {
    findObj = {
      tradable: true,
    };
  }
  const items = await Item.find(findObj).lean();
  console.log(items.length);
  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    try {
      // console.log(item);
      // eslint-disable-next-line no-await-in-loop
      await sellItem(item);
      // return;
    } catch (e) {
      console.log(`${item.steamid}`);
      console.log(e.toString());
    }
  }
};
