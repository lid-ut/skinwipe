require('../logger');
const User = require('../src/models/User');
const Purchase = require('../src/models/Purchase');
const KassaInvoice = require('../src/models/KassaInvoice');
const fs = require('fs');

// email тех кто Покупали Premium и сейчас подписка активна
// User.find({
//     email:{$ne: null},
//     subscriber: true,
//     'subInfo.store': 'android',
//     'subInfo.productId': { $nin: ['com.mezmeraiz.skinswipe.premium12m.trial14', 'com.mezmeraiz.skinswipe.premium1m.trial7'] },
//   },
//   {
//     steamId: 1,
//     email: 1,
//     subscriber: 1,
//   }).limit(20000).then(async users => {
//   console.log(`${users.length}`);
//   for (let user of users) {
//     console.log(user.email);
//   }
//
//   logger.info('Done!');
//   process.exit(1);
// });

// mail тех кто Покупали Premium, но подписка кончилась/не оплатили дальше
const fun = async () => {
  let premiumIds = [];
  premiumIds = [
    ...premiumIds,
    ...(await Purchase.find({
      success: true,
      'data.productId': /premium/i,
    }).distinct('steamId')),
  ];
  premiumIds = [
    ...premiumIds,
    ...(await KassaInvoice.find({
      test: false,
      status: 'succeeded',
      product: 'premium',
    }).distinct('steamId')),
  ];
  console.log(premiumIds.length);

  let coinsIds = [];
  coinsIds = [
    ...coinsIds,
    ...(await Purchase.find({
      success: true,
      'data.productId': /coins/i,
    }).distinct('steamId')),
  ];
  coinsIds = [
    ...coinsIds,
    ...(await KassaInvoice.find({
      test: false,
      status: 'succeeded',
      product: 'coins',
    }).distinct('steamId')),
  ];
  console.log(coinsIds.length);

  const findIds = [...coinsIds, ...premiumIds];
  // for (let coinsId of coinsIds) {
  //   if (premiumIds.indexOf(coinsId) === -1) {
  //     findIds.push(coinsId);
  //   }
  // }
  // console.log(findIds.length);

  const users = await User.find(
    {
      email: { $ne: null },
      subscriber: false,
      steamId: { $nin: findIds },
    },
    {
      steamId: 1,
      email: 1,
      subscriber: 1,
    },
  );

  console.log(`${users.length}`);
  for (let user of users) {
    fs.appendFileSync('emails kagorta 4.txt', user.email + '\n');
  }

  logger.info('Done!');
  process.exit(1);
};

fun(() => {});
