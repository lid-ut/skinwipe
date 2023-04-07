require('../../logger');
const User = require('../../src/models/User');
const KassaInvoice = require('../../src/models/KassaInvoice');

const initSequelize = require('../../src/modules/sequelize/init');

const logsYkassaAdd = async (steamIds, dateStart, dateEnd) => {
  const transactions = await Transactions.findAll({
    where: {
      status: 'done',
      type: 'ykassa_add',
      steamId: { [Op.in]: steamIds },
      createdAt: {
        [Op.gte]: dateStart,
        [Op.lte]: dateEnd,
      },
    },
  });
  let sum = 0;
  let count = 0;

  const users = [];

  for (const tr of transactions) {
    sum += tr.amount;
    count++;
    if (users.indexOf(tr.steamId) === -1) {
      users.push(tr.steamId);
    }
  }

  console.log(sum);
  console.log(count);
  console.log(users.length);

  const kassas = await KassaInvoice.find({
    status: 'succeeded',
    steamId: { $in: steamIds },
  });

  let sumPrem = 0;

  console.log(`count prem ${kassas.length}`);
  let count1 = 0;
  for (const k of kassas) {
    console.log(k.product);
    count1++;
    sumPrem += parseFloat(k.amount.value);
  }

  console.log(`sum prem ${sumPrem}`);
  console.log(`sum prem ${count1}`);
};

initSequelize(async () => {
  let users = await User.find(
    {
      createdAt: {
        $gte: new Date(2021, 11, 29),
        $lte: new Date(2022, 0, 1),
      },
    },
    { money: 1, steamId: 1 },
  );

  const steamIds = users.map(it => it.steamId);

  console.log(steamIds.length);

  const transactions = await Transactions.findAll({
    where: {
      status: 'done',
      type: 'ykassa_add',
      steamId: { [Op.in]: steamIds },
    },
  });

  let sumBalance = 0;
  const steamIdsPaing = [];

  for (const transaction of transactions) {
    if (!steamIdsPaing.find(it => it === transaction.steamId)) {
      steamIdsPaing.push(transaction.steamId);
    }
  }

  for (const user of users) {
    if (steamIdsPaing.find(it => it === user.steamId)) {
      sumBalance += user.money;
    }
  }

  console.log('-------------');
  console.log(sumBalance);
  console.log('-------------');

  await logsYkassaAdd(steamIds, new Date(2021, 11, 29), new Date(2022, 1, 1));
  console.log('-------------');
  await logsYkassaAdd(steamIds, new Date(2022, 1, 1), new Date(2022, 2, 1));
  console.log('-------------');
  await logsYkassaAdd(steamIds, new Date(2022, 2, 1), new Date(2022, 3, 1));
});
