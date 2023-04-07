require('../../../logger');
const initSequelize = require('../../../src/modules/sequelize/init');

const User = require('../../../src/models/User');
const MarketTrade = require('../../../src/models/MarketTrade');

User.find(
  {
    createdAt: { $gte: new Date(2021, 11, 1), $lte: new Date(2022, 0, 1) },
  },
  { steamId: 1 },
)
  .lean()
  .then(async users => {
    console.log(users.length);
    let sum = 0,
      count = 0,
      tradesCount = 0;

    for (const user of users) {
      const trades = await MarketTrade.find({ buyer: user.steamId, type: 'user', status: 'done' });
      if (trades.length > 0) {
        count++;
      }
      for (const trade of trades) {
        tradesCount++;
        for (const item of trade.itemsPartner) {
          sum += item.price.steam.mean;
        }
      }
    }

    console.log(count);
    console.log(tradesCount);
    console.log(sum);
  });
