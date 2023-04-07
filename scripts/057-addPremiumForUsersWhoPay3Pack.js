function log(msg) {
  console.log(msg);
}

global.logger = { log, info: log };
const givePremium = require('../src/helpers/givePremium');
const User = require('../src/models/User');
const Purchases = require('../src/models/Purchase');

(async () => {
  const allSteamIds = await Purchases.find(
    {
      'data.productId': 'mezmeraiz.skinswipe.coins_2000',
      createdAt: { $gte: new Date('2020-10-23T00:00:00.000Z') },
    },
    { steamId: 1 },
  ).limit(10);

  console.log(allSteamIds);

  for (let i = 0; i < allSteamIds; i++) {
    console.log(allSteamIds[i]);
    const user = await User.findOne({ steamId: allSteamIds[i].steamId });
    await givePremium(user, 'for-3-pack-premium', 1, allSteamIds[i].steamId);
  }

  console.log('end');
})();
