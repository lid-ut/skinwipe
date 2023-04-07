const ItemsTransaction = require('../models/ItemsTransaction');

module.exports = async function addItemsTransaction(user, type, status, trade) {
  const itemTransaction = new ItemsTransaction({
    status,
    type,
    steamId: user.steamId,
    token: trade._id,
    botItems: trade.botItems.map(it => it.assetid),
    userItems: trade.userItems.map(it => it.assetid),
  });

  return itemTransaction.save();
};
