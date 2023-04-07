require('../../logger');

const Purchase = require('../../src/models/Purchase');
const User = require('../../src/models/User');

Purchase.find({
  steamId: '76561198439197839',
  $or: [{ 'data.productId': /premium/i }, { token: 'revenue_cat' }],
  success: true,
  createdAt: { $gte: new Date(Date.now() - 370 * 24 * 60 * 60 * 1000) },
})
  .sort({ createdAt: -1 })
  .then(async buys => {
    for (const buy of buys) {
      const user = await User.findOne({ steamId: buy.steamId });

      user.subInfo.push({
        createdAt: new Date(),
        token: buy.token,
        store: buy.token === 'revenue_cat' ? 'apple_revenue_cat' : 'android',
        JSONdata: buy.JSONdata,
        signature: buy.signature,
        productId: buy.data.productId,
      });

      await User.updateOne({ steamId: buy.steamId }, { $set: { subInfo: user.subInfo, subscriber: true } });
    }

    console.log('done');
  });
