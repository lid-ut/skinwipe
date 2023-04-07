require('../../logger');

const KassaInvoice = require('../../src/models/KassaInvoice');
const User = require('../../src/models/User');

KassaInvoice.find({ product: 'premium', status: 'succeeded', createdAt: { $gte: new Date(Date.now() - 370 * 24 * 60 * 60 * 1000) } })
  .sort({ createdAt: -1 })
  .then(async buys => {
    for (const buy of buys) {
      const user = await User.findOne({ steamId: buy.steamId });
      console.log(buy.steamId);

      const expiration = buy.createdAt.getTime() + buy.productCount * 30 * 24 * 60 * 60 * 1000 + 5 * 24 * 60 * 60 * 1000;

      user.subInfo.push({
        expiration,
      });

      await User.updateOne({ steamId: buy.steamId }, { $set: { subInfo: user.subInfo, subscriber: true } });
    }

    console.log('done');
  });
