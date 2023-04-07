require('../logger');
// const User = require('../src/models/User');
const MoneyTransaction = require('../src/models/MoneyTransaction');
const MarketTrade = require('../src/models/MarketTrade');
const changeMoney = require('../src/helpers/changeMoney');
const sumMoneyTransactions = require('../src/helpers/sumMoneyTransactions');
const User = require('../src/models/User');

(async () => {
  // const users = await MoneyTransaction.distinct('steamId', {
  //   token: 'supportChat',
  //   // token: {$in: ['invited', 'invinter']},
  //   createdAt: { $gte: new Date(2021, 3, 1) },
  // });
  // console.log(users.length);

  // const transactions = await MoneyTransaction.find({
  //   token: { $in: ['invited'] },
  //   'info.type': 'pay',
  //   'info.from': 'market',
  //   // token: 'supportChat',
  //   steamId: { $nin: ['76561198096627079', '76561198114352036', '76561198049866608', '76561199070875731'] },
  //   // createdAt: { $gte: new Date(2021, 3, 1) },
  // });
  // let steamids = transactions.map(it => it.steamId);
  //
  // const transactionsCheck = await MoneyTransaction.find({
  //   steamId: { $in: steamids },
  // });
  //
  // let usedMore2 = 0;
  // let sum = 0;
  // let notUser = 0;
  // for (const steamid of steamids) {
  //   const trs = transactionsCheck.filter(it => it.steamId === steamid);
  //   if (trs.length > 2) {
  //     usedMore2++;
  //     for (const tr of trs) {
  //       sum += tr.amount;
  //     }
  //   } else {
  //     notUser++;
  //   }
  // }
  //
  // console.log(usedMore2);
  // console.log(sum);
  // console.log(notUser);

  // console.log(transactions.length);
  // const steamIds = [];
  //
  // const transactions = await MoneyTransaction.find({
  //   // updatedAt: { $gte: new Date(new Date(2021, 6, 0)) },
  //   // 'info.seller': { $ne: 'bot' },
  //   // 'info.status': { $ne: 'fee' },
  //   // 'info.type': { $nin: ['market_sale_bot', 'trade_fee', 'pay'] },
  //   status: 'done',
  //   steamId: { $nin: ['76561198096627079', '76561198114352036', '76561198049866608', '76561199070875731'] },
  //   createdAt: { $gte: new Date(2021, 4, 1) },
  //   // token: { $ne: 'supportChat' },
  // }).sort({ createdAt: -1 });
  //
  // let bolshe = 0;
  // let menishe = 0;
  // for (const transaction of transactions) {
  //   if (transaction.amount > 0) {
  //     // if (transaction.amount > 1000) {
  //     //   const otherTrasnsactions = await MoneyTransaction.find({ token: transaction.token });
  //     //
  //     //   let sumOther = 0;
  //     //   for (const otherTran of otherTrasnsactions) {
  //     //     sumOther += otherTran.amount;
  //     //   }
  //     //   if (sumOther > 0) {
  //     //     console.log(`${sumOther} ${transaction._id} ${transaction.token} ${transaction.amount}`);
  //     //   }
  //     // }
  //     bolshe += transaction.amount;
  //   } else {
  //     menishe += transaction.amount;
  //   }
  // }
  //
  // console.log(bolshe / 100);
  // console.log(menishe / 100);

  // const transactions = await MoneyTransaction.find({
  //   // updatedAt: { $gte: new Date(new Date(2021, 6, 0)) },
  //   // 'info.seller': {$ne: 'bot'},
  //   // 'info.type': { $ne: 'pay' },
  //   // amount: {$gt: 0},
  //   // 'info.status': { $ne: 'fee' },
  //   // $or: [{ status: 'done' }, { status: 'wait', amount: { $lte: 0 } }],
  //   // steamId: '76561198116084988',
  //   steamId: { $nin: ['76561198096627079', '76561198114352036', '76561198049866608', '76561199070875731'] },
  //   // token: { $ne: 'supportChat' },
  //   status: 'done',
  //   createdAt: { $gte: new Date(2021, 7, 3, 0, 0, 0) },
  // }).sort({ createdAt: -1 });
  //
  // let bolshe = 0;
  // let menishe = 0;
  // let sum = 0;
  // for (const transaction of transactions) {
  //   const user = await User.findOne({steamId: transaction.steamId});
  //   // if (user && user.money < 0) {
  //   //   console.log(`${user._id}`);
  //   //   continue;
  //   // }
  //
  //   const count = await MoneyTransaction.countDocuments({token: transaction.token});
  //   if (count < 3 && transaction.amount > 0 && transaction.token.indexOf('balance add') === -1 && transaction.info.type !== 'market_sale_bot') {
  //     console.log(`${transaction.token} ${transaction.amount}`);
  //     sum += transaction.amount;
  //   }
  //   if (transaction.amount > 0) {
  //     bolshe += transaction.amount;
  //   } else {
  //     menishe += transaction.amount;
  //   }
  // }
  // console.log(sum);
  // console.log(
  //   `${bolshe} ${menishe} ${Math.round((bolshe + menishe) / 100)}`,
  // );
  //
  // const notSteamIds = await User.distinct('steamId', { money: { $lt: 0 } });
  //

  //
  //
  // const transactions = await MoneyTransaction.aggregate(
  //   [
  //     {$match: {status: 'done'}},
  //     {$group: {_id: '$steamId', sum: {$sum: '$amount'}}},
  //     {$sort: {sum:-1}}
  //   ]);
  //
  // let bolshe = 0;
  // let menishe = 0;
  // for (const transaction of transactions) {
  //   // const user = await User.findOne({ steamId: transaction.steamId });
  //   // if (user && user.money < 0) {
  //   //   continue;
  //   // }
  //   if (transaction.amount > 0) {
  //     bolshe += transaction.amount;
  //   } else {
  //     menishe += transaction.amount;
  //   }
  // }
  //
  // console.log(bolshe / 100);
  // console.log(menishe / 100);

  // const start = new Date(2021, 7,3);
  // const end = new Date(2021, 7,4,3,0,0);
  //
  //
  // const deleteUsers = await User.distinct('steamId', {money: {$lt: 0}});
  // const resSupport = await MoneyTransaction.aggregate([
  //   {
  //     $match: {
  //       status: 'done',
  //       token: 'supportChat',
  //       // steamId: {$nin: deleteUsers}
  //       createdAt: {$gte: start, $lte: end}
  //     }
  //   },
  //   {$group: {_id: null, sum: {$sum: '$amount'}}},
  // ]);
  //
  // let resInvite = await MoneyTransaction.find({
  //     status: 'done',
  //     amount: 5,
  //     updatedAt: {$lte: end},
  //     steamId: {$nin: deleteUsers},
  //     createdAt: {$gte: start, $lte: end}
  //   }
  // );
  // resInvite = resInvite.filter(it => it.token.length < 24);
  // let sumResInvite = 0;
  // let sumResPromo = 0;
  // for (const tr of resInvite) {
  //   if (tr.token === 'invited' || tr.token === 'inviter' ) {
  //     sumResInvite += tr.amount;
  //   } else {
  //     sumResPromo += tr.amount;
  //   }
  // }
  // console.log(deleteUsers);
  // const res = await MoneyTransaction.aggregate([
  //   {
  //     $match: {
  //       $or: [{status: 'done'}, {status: 'wait', amount: {$lte: 0}}],
  //       updatedAt: {$lte: end},
  //       steamId: {$nin: deleteUsers}
  //     }
  //   },
  //   {$group: {_id: null, sum: {$sum: '$amount'}}},
  // ]);
  //
  //
  // let sumFeeMarket = 0;
  // let countFeeMarket = 0;
  // for (const transaction of transactionsMarketFee) {
  //   countFeeMarket++;
  //   sumFeeMarket += transaction.amount;
  // }
  //
  // const transactionsMarket = await MoneyTransaction.find({
  //   $or: [
  //     {
  //       'info.type': 'trade',
  //       'info.from': 'market',
  //     },
  //     {
  //       'info.type': 'market_bot',
  //       'info.status': 'buy',
  //       'info.seller': 'user'
  //     }
  //   ],
  //   status: 'done',
  //   createdAt: {$gte: sdate, $lte: edate}
  // });
  // const sellers = [];
  // const buyers = [];
  // let sumTradesMarket = 0;
  // for (const transaction of transactionsMarket) {
  //   if (transaction.amount > 0) {
  //     if (sellers.indexOf(transaction.steamId) === -1) {
  //       sellers.push(transaction.steamId);
  //     }
  //     sumTradesMarket += transaction.amount;
  //   } else {
  //     if (buyers.indexOf(transaction.steamId) === -1) {
  //       buyers.push(transaction.steamId);
  //     }
  //   }
  // }
  //
  //
  // let text = `Покупателей: ${buyers.length} Продавцов: ${sellers.length}\n`;
  // text += `Маркет: ${countFeeMarket} = $${Math.round(sumTradesMarket / 100)}->$${Math.round(sumFeeMarket * -1) / 100}\n`;
  //
  //
  //
  // console.log(`Баланс пользователей: $${(res.length > 0 ? res[0].sum / 100 : 0).toFixed(2)}\nПоддержка выдала: $${(resSupport.length > 0 ? resSupport[0].sum / 100 : 0).toFixed(2)}\nРеферальная программа: $${(sumResInvite / 100).toFixed(2)}\nПромокоды от блогеров: $${(sumResPromo / 100).toFixed(2)}`);

  const trades = await MarketTrade.find({ status: 'done', type: 'bot', buyer: { $ne: '76561198114352036' } });
  // console.log(trades.length);
  const transactions = await MoneyTransaction.find({ token: { $in: trades.map(it => it._id.toString()) } });
  // console.log(transactions.length);

  let no = 0;
  let noM = 0;
  let allSum = 0;
  for (const trade of trades) {
    const trs = transactions.filter(it => it.token === trade._id.toString());

    if (trs.length === 0) {
      if (trade.items.length > 0) {
        no++;
      } else if (trade.itemsPartner.length > 0) {
        noM++;

        let sum = 0;
        for (const item of trade.itemsPartner) {
          sum += item.price.steam.mean;
        }
        allSum += sum;
        // const user = await User.findOne({ steamId: trade.buyer });
        // console.log(`${user.personaname} ${user.money}`);
        // await changeMoney(user, 'done', trade._id, -1 * sum, );
        // await sumMoneyTransactions(user);
        // console.log(`${user.personaname} ${user.money}`);
      }
    } else {
      // for (const tr of trs) {
      //   // if (tr.status !== 'done') {
      //   //   await MoneyTransaction.updateMany({ _id: tr._id }, { $set: { status: 'done' } });
      //   //   const user = await User.findOne({ steamId: trade.buyer });
      //   //   await sumMoneyTransactions(user);
      //   // }
      // }
    }
    //
    // for (const tr of trs) {
    //   if (tr.status !== trade.status) {
    //     // console.log(tr._id);
    //     derty++;
    //   }
    // }
  }

  // console.log(no);
  // console.log(noM);
  console.log(allSum / 100);

  // const steamIds = await MoneyTransaction.distinct('steamId', { token: /balance add/i });
  //
  //
  // const transactions = await MoneyTransaction.find({
  //   status: 'done',
  //   steamId: { $in: steamIds },
  //
  // });
  //
  // let sum = 0;
  // for (const transaction of transactions) {
  //
  //   if (transaction.token && transaction.token.length === 24) {
  //     sum += transaction.amount;
  //   }
  // }

  // console.log(sum);
})();
