require('../../../logger');
const fetch = require('node-fetch');
const Bot = require('../../../src/models/BotSteam');
const config = require('../../../config');

module.exports = async callback => {
  let bots = [];
  try {
    const res = await fetch(`${config.botsManagerUrl}/bots`).then(botsRes => botsRes.json());
    if (!res.success) {
      callback();
      return;
    }
    bots = res.result;
  } catch (e) {
    console.log(e.toString());
    return;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const bot of bots) {
    // eslint-disable-next-line no-await-in-loop
    let botDB = await Bot.findOne({ steamid: bot.steamid });
    if (!botDB) {
      botDB = new Bot({ steamid: bot.steamid });
    }
    botDB.name = bot.name;
    botDB.register = bot.register;
    botDB.ban = bot.ban;
    botDB.server = bot.server;
    botDB.active = bot.active;
    botDB.itemsCount = bot.itemsCount;
    botDB.lastTradeSend = bot.lastTradeSend;
    // eslint-disable-next-line no-await-in-loop
    await botDB.save();
  }

  await Bot.updateMany({ active: true }, { $set: { itemsUpdated: false } });
  callback();
};
