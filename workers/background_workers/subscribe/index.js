const User = require('../../../src/models/User');
const Purchase = require('../../../src/models/Purchase');
const revenue = require('../../../src/modules/subscriptions/ios/revenuecat/check');
const android = require('../../../src/modules/subscriptions/android/check');
const ios = require('../../../src/modules/subscriptions/ios/check');

module.exports = async done => {
  await new Promise(resolve => {
    Purchase.find({
      // steamId: '76561199124034271',
      // _id: '60f02eaa16c39b4a6eddcb24',
      $or: [{ lastCheck: null }, { lastCheck: { $lte: Date.now() - 3 * 60 * 60 * 1000 } }],
      success: true,
      status: { $nin: ['ended', 'canceled'] },
      createdAt: { $gte: new Date(Date.now() - 2 * 12 * 30 * 24 * 60 * 60 * 1000) },
    })
      .cursor()
      .eachAsync(
        async purchase => {
          let datas = purchase.data;
          if (!datas[0]) {
            datas = [purchase.data];
          }
          // eslint-disable-next-line no-restricted-syntax
          for (const data of datas) {
            // eslint-disable-next-line no-await-in-loop
            const user = await User.findOne({ steamId: purchase.steamId });

            if (data.token === 'revenue_cat') {
              if (data.status === 'paid' || data.status === 'trial') {
                // eslint-disable-next-line no-await-in-loop
                await revenue(user);
              }
            }
            if (data.productId.indexOf('productId') !== -1) {
              if (data.service === 'google') {
                // eslint-disable-next-line no-await-in-loop
                await android(user, purchase);
              } else {
                // eslint-disable-next-line no-await-in-loop
                await ios(user, purchase);
              }
            }
          }

          purchase.lastCheck = Date.now();
          // eslint-disable-next-line no-await-in-loop
          await purchase.save();
        },
        { parallel: 50 },
      )
      .then(() => {
        console.log('End');
        resolve();
      });
  });
  done();
  //
  // // eslint-disable-next-line no-restricted-syntax
  // for (const purchase of purchases) {
  //   console.log(purchase._id);
  //   let datas = purchase.data;
  //   if (!datas[0]) {
  //     datas = [purchase.data];
  //   }
  //   // eslint-disable-next-line no-restricted-syntax
  //   for (const data of datas) {
  //     // eslint-disable-next-line no-await-in-loop
  //     const user = await User.findOne({ steamId: purchase.steamId });
  //
  //     if (data.token === 'revenue_cat') {
  //       if (data.status === 'paid' || data.status === 'trial') {
  //         // eslint-disable-next-line no-await-in-loop
  //         await revenue(user);
  //       }
  //     }
  //     if (data.productId.indexOf('productId') !== -1) {
  //       if (data.service === 'google') {
  //         // eslint-disable-next-line no-await-in-loop
  //         await android(user, purchase);
  //       } else {
  //         // eslint-disable-next-line no-await-in-loop
  //         await ios(user, purchase);
  //       }
  //     }
  //   }
  //
  //   purchase.lastCheck = Date.now();
  //   // eslint-disable-next-line no-await-in-loop
  //   await purchase.save();
  // }
};
