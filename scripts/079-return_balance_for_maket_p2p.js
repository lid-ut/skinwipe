// require('../logger');
// const User = require('../src/models/User');
// const Settings = require('../src/models/Settings');
// const MarketTrade = require('../src/models/MarketTrade');
// const MoneyTransaction = require('../src/models/MoneyTransaction');
// const changeMoney = require('../src/helpers/changeMoney');
// const sumMoneyTransactions = require('../src/helpers/sumMoneyTransactions');
//
// (async () => {
//   const trades = await MarketTrade.find({ status: 'done' });
//
//   let count = 0;
//   for (const trade of trades) {
//     const trans = await MoneyTransaction.find({ token: trade._id });
//
//     if (trans.length === 0) {
//       console.log(trade._id);
//
//       // eslint-disable-next-line no-await-in-loop
//       const setting = await Settings.findOne();
//       let sellerSum = 0;
//       let buyerSum = 0;
//
//       // eslint-disable-next-line no-restricted-syntax
//       for (const item of trade.itemsPartner) {
//         sellerSum += item.price.steam.mean;
//         buyerSum -= item.price.steam.mean;
//       }
//       // eslint-disable-next-line no-restricted-syntax
//       for (const item of trade.items) {
//         buyerSum += item.price.steam.mean;
//       }
//
//       // eslint-disable-next-line no-await-in-loop,no-await-in-loop
//       const seller = await User.findOne({ steamId: trade.seller });
//       // eslint-disable-next-line no-await-in-loop
//       const buyer = await User.findOne({ steamId: trade.buyer });
//
//       if (seller) {
//         let fee = setting.market.fee;
//         if (seller.subscriber) {
//           fee = setting.market.feePremium;
//         }
//
//         let amountFee = (sellerSum * fee) / 100;
//         if (amountFee < 1) {
//           amountFee = 1;
//         }
//         // eslint-disable-next-line no-await-in-loop
//         await changeMoney(seller, 'done', trade._id, sellerSum, {
//           type: 'trade',
//           from: 'market',
//         });
//         // eslint-disable-next-line no-await-in-loop
//         await changeMoney(seller, 'done', trade._id, -1 * amountFee, {
//           type: 'trade_fee',
//           from: 'market',
//         });
//         // eslint-disable-next-line no-await-in-loop
//         await sumMoneyTransactions(seller);
//       }
//       // eslint-disable-next-line no-await-in-loop
//       await changeMoney(buyer, 'done', trade._id, buyerSum, {
//         type: 'trade',
//         from: 'market',
//       });
//       // eslint-disable-next-line no-await-in-loop
//       await sumMoneyTransactions(buyer);
//     }
//   }
//
//   console.log(`${count}`);
// })();
