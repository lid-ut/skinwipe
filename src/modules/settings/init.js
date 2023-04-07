const Settings = require('../../models/Settings');

module.exports = async () => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = new Settings({
      market: {
        server: {
          newBotItems: false,
        },
        feePremium: 3,
        fee: 6,
        instantSell: false,
        all: false,
        premium: false,
        discount: 7,
        poolling: true,
        poollingInterval: 30,
        minInstantSkinPrice: 30,
        virtualResale: false,
        instantSaleDiscountEnabled: false,
        instantSaleDiscount: 3,
      },
      traders: {
        online: 6023,
        all: 489476,
        balance: 520556,
      },
      testers: ['76561198114352036', '76561198123225195', '76561198049866608', '76561198116084988'],
      enableLocalCartNotification: true,
      fee: 3,
      p2p: false,
      USDtoRUB: 71.63,
      overstock: 200,
    });

    await settings.save();
  }
};
