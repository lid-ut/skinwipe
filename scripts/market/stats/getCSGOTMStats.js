require('../../../logger');
const initSequelize = require('../../../src/modules/sequelize/init');

const User = require('../../../src/models/User');

initSequelize(async () => {
  // for (let day = 1; day <= 4; day++) {
  const users = await User.find({
    steamId: { $nin: ['76561198096627079', '76561198114352036'] },
    createdAt: { $gte: new Date(2022, 5, 23) },
  }).lean();

  console.log(users.length);

  const transactions = await Transactions.findAll({
    where: {
      steamId: { [Op.in]: users.map(it => it.steamId) },
      status: 'done',
    },
  });

  const steamIds_add = [];
  const steamIds_sell = [];
  const steamIds_buy = [];

  const stats = {
    all: 0,
  };

  for (const tr of transactions) {
    if (!stats[tr.type]) {
      stats[tr.type] = 0;
    }
    stats[tr.type] += tr.amount;
    stats['all'] += tr.amount;

    if (tr.type === 'ykassa_add') {
      if (steamIds_add.findIndex(it => it === tr.steamId) === -1) steamIds_add.push(tr.steamId);
    }
    if (tr.type === 'sell_market_bot' || tr.type === 'sell_market_p2p') {
      if (steamIds_sell.findIndex(it => it === tr.steamId) === -1) steamIds_sell.push(tr.steamId);
    }
    if (tr.type === 'buy_market_p2p') {
      if (steamIds_buy.findIndex(it => it === tr.steamId) === -1) steamIds_buy.push(tr.steamId);
    }
  }

  // stats.date = new Date(2022, 5, day);
  stats.users = users.length;
  stats.users_add_balance = steamIds_add.length;
  stats.users_sell = steamIds_sell.length;
  stats.users_buy = steamIds_buy.length;

  console.log(stats);
  // }
});
