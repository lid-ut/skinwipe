require('../logger');
const MoneyTransaction = require('../src/models/MoneyTransaction');
const User = require('../src/models/User');

(async () => {
  // const dateDivHour = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const steamIds = await MoneyTransaction.distinct('steamId', { status: 'done' });

  const users = await User.find({ steamId: { $in: steamIds }, createdAt: { $gte: Date.now() - 17 * 24 * 60 * 60 * 1000 } });

  console.log(users.length);
  //
  // const localeCounter = [];
  // for (const user of users) {
  //   // localeCounter[user.locale] = localeCounter[user.locale] ? localeCounter[user.locale] + 1: 1;
  //
  //   let locale = localeCounter.filter(it => it.locale === user.locale)[0];
  //   if (!locale) {
  //     locale = {
  //       locale: user.locale,
  //       count: 1,
  //     };
  //     localeCounter.push(locale);
  //   } else {
  //     locale.count++;
  //   }
  // }
  //
  // localeCounter.sort((a, b) => {
  //   if (a.count < b.count) {
  //     return -1;
  //   }
  //   if (a.count > b.count) {
  //     return 1;
  //   }
  //   // a должно быть равным b
  //   return 0;
  // });

  // console.log(localeCounter);
})();
