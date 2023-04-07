const fs = require('fs');
require('../../../logger');

const initSequelize = require('../../../src/modules/sequelize/init');

const getSumByType = async (type, date) => {
  const query = `SELECT sum(\"amount\") FROM public.transactions where type = '${type}' and \"status\" = 'done' and \"createdAt\"::date = '${date}'::date`;
  // console.log(query);
  const res = await sequelize.query(query);
  return res[0][0].sum || 0;
};

const getSumAll = async date => {
  const query = `SELECT sum(\"amount\") FROM public.transactions where \"status\" = 'done' and \"createdAt\"::date < '${date}'::date`;
  // console.log(query);
  const res = await sequelize.query(query);
  return res[0][0].sum || 0;
};

initSequelize(async () => {
  let startDate = new Date(2022, 3, 19);
  console.log(startDate);
  let text =
    'Дата,Баланс,Добавил админ,Покупка у бота,Покупка у бота вирт,Покупка у пользователя,инвайт,промо,Восстановлен,Продажа боту,Продажа боту виртуальных,Продажа пользователю,Комиссия за продажу пользваотелю,Пополнения\n';
  while (true) {
    if (startDate > new Date()) {
      break;
    }
    console.log(`Старт: ${startDate}`);

    let sqldate = new Date(startDate).toISOString().slice(0, 19).replace('T', ' ');

    const all = await getSumAll(sqldate);
    const admin_add = await getSumByType('admin_add', sqldate);
    const restore_admin = await getSumByType('restore_admin', sqldate);
    const restore_balance = await getSumByType('restore_balance', sqldate);
    const buy_market_bot = await getSumByType('buy_market_bot', sqldate);
    const buy_market_bot_virtual = await getSumByType('buy_market_bot_virtual', sqldate);
    const buy_market_p2p = await getSumByType('buy_market_p2p', sqldate);
    const invite = await getSumByType('invite', sqldate);
    const promo = await getSumByType('promo', sqldate);
    // const restore_balance = await getSumByType('restore_balance', sqldate);
    const sell_market_bot = await getSumByType('sell_market_bot', sqldate);
    const sell_market_bot_virtual = await getSumByType('sell_market_bot_virtual', sqldate);
    const sell_market_p2p = await getSumByType('sell_market_p2p', sqldate);
    const sell_market_p2p_fee = await getSumByType('sell_market_p2p_fee', sqldate);
    const ykassa_add = await getSumByType('ykassa_add', sqldate);

    let dateString = `${startDate.getFullYear()}.${startDate.getMonth() + 1}.${startDate.getDate()}`;
    // console.log(restore_balance);
    text += `${dateString},${all},${
      admin_add + restore_admin
    },${buy_market_bot},${buy_market_bot_virtual},${buy_market_p2p},${invite},${promo},${restore_balance},${sell_market_bot},${sell_market_bot_virtual},${sell_market_p2p},${sell_market_p2p_fee},${ykassa_add}\n`;
    startDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    console.log(`Стоп: ${startDate}`);
  }

  fs.writeFile('dataTransactions.csv', text, 'utf8', function (err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
    } else {
      console.log("It's saved!");
    }
  });
});
