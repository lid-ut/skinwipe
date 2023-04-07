require('../logger');
const Purchases = require('../src/models/Purchase');
const KassaInvoice = require('../src/models/KassaInvoice');

(async () => {
  const startDate = new Date('2020-08-01 00:00:00.000Z');
  const endDate = new Date('2020-08-31 23:59:59.999Z');

  const lastPurchases = await Purchases.find({
    createdAt: { $gte: startDate, $lte: endDate },
    success: true,

  }).sort({ createdAt: 1 });

  const lastPurchasesKassa = await KassaInvoice.find({
    createdAt: { $gte: startDate, $lte: endDate },
    status: 'succeeded',
    steamId: {
      $in: [

      ],
    },
  }).sort({ createdAt: 1 });

  let coin_11000 = 0;
  let coin_2000 = 0;
  let coin_455 = 0;
  let coin_75 = 0;

  let premium = 0;
  let premium3m = 0;
  let premium6m = 0;
  let premium12m = 0;
  console.log(`lastPurchases.length ${lastPurchases.length}`);

  for (const p of lastPurchases) {
    let datas = [p.data];
    if (p.data.length > 0) {
      datas = p.data;
    }

    for (let data of datas) {
      if (data) {
        switch (data.productId) {
          case 'coin_11000':
            coin_11000++;
            break;
          case 'coin_2000':
            coin_2000++;
            break;
          case 'coin_455':
            coin_455++;
            break;
          case 'coin_75':
            coin_75++;
            break;
          case 'mezmeraiz.skinswipe.coins_11000':
            if (data.purchaseTime && new Date(data.purchaseTime) > startDate) {
              coin_11000++;
            }
            break;
          case 'mezmeraiz.skinswipe.coins_2000':
            if (data.purchaseTime && new Date(data.purchaseTime) > startDate) {
              coin_2000++;
            }
            break;
          case 'mezmeraiz.skinswipe.coins_455':
            if (data.purchaseTime && new Date(data.purchaseTime) > startDate) {
              coin_455++;
            }
            break;
          case 'mezmeraiz.skinswipe.coins_75':
            if (data.purchaseTime && new Date(data.purchaseTime) > startDate) {
              coin_75++;
            }
            break;

          case 'com.mezmeraiz.skinswipe.premium':
            if (data.purchaseTime && new Date(data.purchaseTime) > startDate) {
              premium++;
            }
            break;
          case 'com.mezmeraiz.skinswipe.premium3m':
            if (data.purchaseTime && new Date(data.purchaseTime) > startDate) {
              premium3m++;
            }
            break;
          case 'com.mezmeraiz.skinswipe.premium6m':
            if (data.purchaseTime && new Date(data.purchaseTime) > startDate) {
              premium6m++;
            }
            break;
          case 'com.mezmeraiz.skinswipe.premium12m':
            if (data.purchaseTime && new Date(data.purchaseTime) > startDate) {
              premium12m++;
            }
            break;
          case 'com.mezmeraiz.skinswipe.premium_monthly':
            if (data.purchaseTime && new Date(data.purchaseTime) > startDate) {
              premium++;
            }
            break;
          case 'premium_180_trial_0_price_399':
            if (data.purchaseDateMs && new Date(data.purchaseDateMs) > startDate) {
              premium6m++;
            }
            break;
          case 'premium_30_trial_7_price_899_date_20181017':
            if (data.purchaseDateMs && new Date(data.purchaseDateMs) > startDate) {
              premium++;
            }
            break;
          case 'premium_360_trial_0_price_649':
            if (data.purchaseDateMs && new Date(data.purchaseDateMs) > startDate) {
              premium12m++;
            }
            break;
          case 'premium_60_trial_0_price_299':
            if (data.purchaseDateMs && new Date(data.purchaseDateMs) > startDate) {
              premium3m++;
            }
            break;
          case 'skinswipe.premium_monthly':
            if (data.purchaseDateMs && new Date(data.purchaseDateMs) > startDate) {
              premium++;
            }
            break;
        }
      }
    }
  }

  let premiumk = 0;
  let premium3mk = 0;
  let premium6mk = 0;
  let premium12mk = 0;

  for (const kItem of lastPurchasesKassa) {
    if (kItem.product === 'premium') {
      switch (kItem.productCount) {
        case 1:
          premiumk++;
          break;
        case 3:
          premium3mk++;
          break;
        case 6:
          premium6mk++;
          break;
        case 12:
          premium12mk++;
          break;
      }
    }
  }

  console.log(`coin_11000 ${coin_11000}`);
  console.log(`coin_2000 ${coin_2000}`);
  console.log(`coin_455 ${coin_455}`);
  console.log(`coin_75 ${coin_75}`);

  console.log(`premium12m ${premium12m}`);
  console.log(`premium6m ${premium6m}`);
  console.log(`premium3m ${premium3m}`);
  console.log(`premium1m ${premium}`);

  console.log(`premiumk ${premiumk}`);
  console.log(`premium3mk ${premium3mk}`);
  console.log(`premium6mk ${premium6mk}`);
  console.log(`premium12mk ${premium12mk}`);
})();
