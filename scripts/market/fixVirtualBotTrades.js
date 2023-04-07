require('../../logger');
const MarketTrade = require('../../src/models/MarketTrade');
const User = require('../../src/models/User');
const sumMoneyTransactions = require('../../src/helpers/sumMoneyTransactions');
const initSequelize = require('../../src/modules/sequelize/init');
const changeMoney = require('../../src/helpers/changeMoney');

initSequelize(async () => {
  const assetids = await MarketTrade.distinct('itemsPartner.assetid', {
    type: 'bot',
    status: 'done',
    virtual: true,
    createdAt: { $gte: new Date(2021, 11, 1) },
  });

  console.log(assetids);

  let sumRestore = 0;

  for (const assetid of assetids) {
    const trades = await MarketTrade.find({
      status: 'done',
      virtual: true,
      'itemsPartner.assetid': assetid,
    }).sort({ createdAt: 1 });

    if (trades.length > 1) {
      for (let i = 0; i < trades.length - 1; i++) {
        const trade = trades[i];
        const item = trade.itemsPartner.find(it => it.assetid === assetid);

        const user = await User.findOne({ steamId: trade.buyer });

        if (trade.itemsPartner.length > 1) {
          console.log(`${trade.code} часть ${item.price.steam.mean} ${assetid}`);
          await changeMoney(user, 'restore_balance', 'in', 'done', 'restore_for_virtual', Math.round(item.price.steam.mean));
        } else {
          console.log(`${trade.code} весь ${item.price.steam.mean} ${assetid}`);
          console.log({
            steamId: trade.buyer,
            status: 'done',
            token: trade._id.toString(),
          });

          const transaction = await Transactions.findOne({
            where: {
              steamId: trade.buyer,
              status: 'done',
              token: trade._id.toString(),
            },
          });
          if (transaction) {
            transaction.status = 'close';
            transaction.save();
          }
          await sumMoneyTransactions(user);
        }

        trade.status = 'close';
        await trade.save();
        sumRestore += item.price.steam.mean;
      }

      console.log(sumRestore);
    }
  }

  console.log('done');
});
