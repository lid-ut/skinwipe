const fetch = require('node-fetch');
const BotSteam = require('../../../src/models/BotSteam');

const getCSGOTMBalance = async key => {
  try {
    const res = await fetch(`https://market.csgo.com/api/v2/get-money?key=${key}`);
    return res.json();
  } catch (e) {
    console.log(e);
  }
  return 0;
};

module.exports = async () => {
  const bots = await BotSteam.find({ csgotmKey: { $ne: null } });

  // eslint-disable-next-line no-restricted-syntax
  for (const bot of bots) {
    // eslint-disable-next-line no-await-in-loop
    const res = await getCSGOTMBalance(bot.csgotmKey);
    let csgotmBalance = 0;
    if (res.success) {
      csgotmBalance = res.money;
    }
    // eslint-disable-next-line no-await-in-loop
    await BotSteam.updateOne({ _id: bot._id }, { $set: { csgotmBalance } });
  }
};
