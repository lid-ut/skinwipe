const FireCoin = require('../../models/FireCoin');
const Purchase = require('../../models/Purchase');
const Transaction = require('../../models/Transaction');

module.exports = async function process(req) {
  const fireCoins = await FireCoin.find({ steamId: req.user.steamId }, { steamId: 0 }).sort({ createdAt: 1 }).lean();
  const fireCoinsCount = fireCoins
    .filter(fc => new Date(fc.expiration).getTime() > Date.now())
    .reduce((sum, cur) => (sum || 0) + cur.amount - cur.used, 0);

  const purchases = [];

  fireCoins.forEach(fc => {
    purchases.push({
      type: 'fireCoins',
      createdAt: fc.createdAt,
      amount: fc.amount,
      used: fc.used,
      expiration: fc.expiration,
      expired: new Date(fc.expiration) < new Date(),
    });
  });

  let userPurchases = await Purchase.find({ steamId: req.user.steamId, success: true, 'data.productId': /premium/i });
  const userTransactions = await Transaction.find({ user_steam_id: req.user.steamId });

  if (req.user.subInfo) {
    const subInfoPurchases = userPurchases.filter(pur => req.user.subInfo.find(si => si.token === pur.token));
    userPurchases = userPurchases.filter(pur => !subInfoPurchases.find(siPur => siPur._id === pur._id));
    req.user.subInfo.forEach(si => {
      let startDate = 0;
      if (typeof si.expirationTime === 'string') {
        si.expirationTime = parseInt(si.expirationTime, 10);
      }
      let endDate = +new Date(si.expiration || si.expirationTime || si.expiresDateMs || Date.now());
      if (!subInfoPurchases.length) {
        startDate = si.start || si.purchaseDateMs || Date.now();
      }
      for (let j = 0; j < subInfoPurchases.length; j++) {
        if (subInfoPurchases[j].token !== si.token) {
          // eslint-disable-next-line no-continue
          continue;
        }
        if (subInfoPurchases[j].data.purchaseTime) {
          if (subInfoPurchases[j].data.purchaseTime > startDate) {
            startDate = subInfoPurchases[j].data.purchaseTime;
          }
        } else if (subInfoPurchases[j].data.purchaseDateMs) {
          if (subInfoPurchases[j].data.purchaseDateMs > startDate) {
            startDate = subInfoPurchases[j].data.purchaseDateMs;
          }
        } else if (subInfoPurchases[j].data[0].purchaseTime) {
          if (subInfoPurchases[j].data[0].purchaseTime > startDate) {
            startDate = subInfoPurchases[j].data[0].purchaseTime;
          }
        } else if (subInfoPurchases[j].data[0].purchaseDateMs) {
          if (subInfoPurchases[j].data[0].purchaseDateMs > startDate) {
            startDate = subInfoPurchases[j].data[0].purchaseDateMs;
          }
        }
      }
      startDate = parseInt(startDate, 10);
      endDate = parseInt(endDate, 10);
      purchases.push({
        type: 'premium',
        createdAt: new Date(startDate).toISOString(),
        expiration: new Date(endDate).toISOString(),
        expired: new Date(endDate).getTime() < Date.now(),
      });
    });
  }

  userPurchases.forEach(pur => {
    let startDate = pur.start || pur.purchaseDateMs || Date.now();
    let endDate = Date.now();
    if (pur.data.purchaseTime) {
      startDate = pur.data.start || pur.data.purchaseTime;
      endDate = pur.data.expiration || pur.data.expirationTime || pur.data.expirationDate;
    } else if (pur.data.purchaseDateMs) {
      startDate = pur.data.start || pur.data.purchaseDateMs;
      endDate = pur.data.expiration || pur.data.expirationTime || pur.data.expirationDate;
    } else if (pur.data[0].purchaseTime) {
      startDate = pur.data[0].start || pur.data[0].purchaseTime;
      endDate = pur.data[0].expiration || pur.data[0].expirationTime || pur.data[0].expirationDate;
    } else if (pur.data[0].purchaseDateMs) {
      startDate = pur.data[0].start || pur.data[0].purchaseDateMs;
      endDate = pur.data[0].expiration || pur.data[0].expirationTime || pur.data[0].expirationDate;
    }
    startDate = parseInt(startDate, 10);
    endDate = parseInt(endDate, 10);
    purchases.push({
      type: 'premium',
      createdAt: new Date(startDate).toISOString(),
      expiration: new Date(endDate).toISOString(),
      expired: new Date(endDate).getTime() < Date.now(),
    });
  });

  userTransactions.forEach(trc => {
    purchases.push({
      type: 'transaction',
      entity: trc.usedEntity || 'coins',
      createdAt: trc.createdAt,
      amount: trc.amount,
    });
  });

  purchases.sort((b, a) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  return {
    status: 'success',
    result: {
      subscriber: req.user.subscriber,
      coinCount: req.user.coinCount,
      fireCoinsCount,
      purchases,
    },
  };
};
