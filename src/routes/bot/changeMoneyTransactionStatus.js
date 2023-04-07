const User = require('../../models/User');
const BotSteam = require('../../models/BotSteam');
const MoneyTransaction = require('../../models/MoneyTransaction');
const changeItems = require('../../helpers/changeItems');
const sumMoneyTransactions = require('../../helpers/sumMoneyTransactions');
const resetInventory = require('../../helpers/resetInventory');

module.exports = async (req, res) => {
  await changeItems(req.body.id, req.body.status);

  const transaction = await MoneyTransaction.findOne({ token: req.body.id });
  if (!transaction) {
    res.json({ success: false });
    return;
  }
  if (req.body.status === 'done') {
    if (req.body.botsSteamIds.length > 0) {
      await BotSteam.updateMany({ steamid: { $in: req.body.botsSteamIds } }, { $set: { itemsUpdated: false } });
    }
    await resetInventory(transaction.steamId, true);
  }
  transaction.status = req.body.status;
  await transaction.save();

  const user = await User.findOne({ steamId: transaction.steamId });
  await sumMoneyTransactions(user);
  res.json({ success: true });
};
