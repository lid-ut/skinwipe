const BotSteam = require('../../../../src/models/BotSteam');

module.exports = async () => {
  await BotSteam.updateMany({ active: true }, { $set: { itemsUpdated: false } });
};
