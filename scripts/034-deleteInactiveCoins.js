// require('../logger');
// const Transactions = require('../src/models/Transaction');
// const Users = require('../src/models/User');
//
// Transactions.find({
//   token: 'inactive',
// }).then(async transactions => {
//   const deadLine = Date.now() - 7 * 24 * 60 * 60 * 1000;
//   for (let i = 0; i < transactions.length; i++) {
//     const transaction = transactions[i];
//     logger.info(`[${i + 1}/${transactions.length}] transaction: ${transaction.token} ${transaction.user_steam_id} ${transaction.amount}`);
//     const user = await Users.findOne({ steamId: transaction.user_steam_id });
//     if (user) {
//       logger.info(`User: ${user.personaname} ${user.coinCount} ${user.lastActiveDate}`);
//       const last = new Date(user.lastActiveDate).getTime();
//       if (deadLine > last && (await checkCoins(user, transaction.amount))) {
//         logger.info(`DEAD: ${user.personaname}`);
//         await Users.updateOne({ steamId: transaction.user_steam_id }, { $set: { coinCount: user.coinCount - transaction.amount } });
//         await Transactions.deleteOne({ id: transaction.id });
//       } else if (!(await checkCoins(user, transaction.amount))) {
//         await Transactions.deleteOne({ id: transaction.id });
//       }
//     }
//   }
//   logger.info('Done!');
//   process.exit(1);
// });
