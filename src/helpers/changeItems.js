const BotSteamItem = require('../models/BotSteamItem');
const User = require('../models/User');
const ItemsTransaction = require('../models/ItemsTransaction');
const deleteUserItems = require('./deleteUserItems');
const sendPushV3 = require('./sendPushV3');

module.exports = async function changeItems(token, status) {
  // const transaction = await ItemsTransaction.findOne({ token });
  // if (!transaction) {
  //   console.log(`no items transaction ${token}`);
  //   return;
  // }
  // if (status === 'done') {
  //   if (transaction.type === 'buy') {
  //     await BotSteamItem.updateMany({ assetid: transaction.botItems }, { buyer: transaction.steamId });
  //     await BotSteamItem.updateMany({ assetid: transaction.userItems }, { buyer: null, reserver: null, virtual: false });
  //     if (transaction.userItems.length > 0) {
  //       await deleteUserItems(transaction.userItems);
  //       const user = await User.findOne({ steamId: transaction.steamId });
  //       await sendPushV3(user, { type: 'UPDATE_MARKET_INVENTORY' });
  //     }
  //   } else if (transaction.type === 'send') {
  //     await BotSteamItem.deleteMany({ assetid: { $in: transaction.botItems }, virtual: true });
  //   }
  // } else if (status === 'close') {
  //   if (transaction.type === 'buy') {
  //     await BotSteamItem.updateMany(
  //       { assetid: { $in: transaction.botItems } },
  //       { $set: { reserver: null, virtual: false, withdrawn: false } },
  //     );
  //     await BotSteamItem.updateMany({ assetid: { $in: transaction.userItems }, virtual: true }, { $set: { withdrawn: false } });
  //   } else if (transaction.type === 'send') {
  //     await BotSteamItem.updateMany({ assetid: { $in: transaction.botItems }, virtual: true }, { $set: { withdrawn: false } });
  //   }
  // }
  // transaction.status = status;
  // await transaction.save();
};
