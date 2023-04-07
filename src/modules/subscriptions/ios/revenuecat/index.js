const fetch = require('node-fetch');
const Purchase = require('../../../../models/Purchase');

const config = require('../../../../../config');

const getSunInfo = async (sub, key) => {
  return {
    createdAt: new Date(sub.purchase_date),
    productId: key,
    store: 'apple_revenue_cat',
    isTrial: sub.period_type !== 'normal',
    purchaseDate: new Date(sub.purchase_date),
    purchaseDateMs: new Date(sub.purchase_date).getTime(),
    start: new Date(sub.purchase_date).getTime(),
    expiration: new Date(sub.expires_date).getTime(),
    expirationDate: new Date(sub.expires_date).getTime(),
  };
};

const validateSub = async (user, sub, key) => {
  const purchase = await Purchase.findOne({
    steamId: user.steamId,
    'data.purchase_date': new Date(sub.purchase_date).getTime(),
    'data.productId': key,
  });
  if (!purchase) {
    return false;
  }
  if (sub.unsubscribe_detected_at) {
    purchase.data.cancelReason = 1;
    purchase.status = 'canceled';
    await purchase.save();
    return false;
  }
  if (new Date(sub.expires_date).getTime() < Date.now()) {
    purchase.data.cancelReason = 1;
    purchase.status = 'ended';
    await purchase.save();
    return false;
  }
  if (purchase.data.expiration !== new Date(sub.expires_date).getTime()) {
    if (sub.period_type === 'normal') {
      purchase.status = 'paid';
    }

    purchase.data = {
      is_sandbox: sub.is_sandbox,
      cancelReason: !!sub.unsubscribe_detected_at,
      orderId: '',
      productId: key,
      service: 'apple',
      purchase_date: new Date(sub.purchase_date).getTime(),
      expirationTime: new Date(sub.expires_date).getTime(),
      start: new Date(sub.purchase_date).getTime(),
      expiration: new Date(sub.expires_date).getTime(),
    };

    await purchase.save();
  }
  return getSunInfo(sub, key);
};

module.exports = async (user, userSub) => {
  const url = `https://api.revenuecat.com/v1/subscribers/${user.steamId}`;

  const options = {
    method: 'GET',
    headers: {
      'X-Platform': 'ios',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.revenueCat.ios}`,
    },
  };
  const res = await fetch(url, options).catch(e => e.toString());

  const json = await res.json();

  return validateSub(user, json.subscriber.subscriptions[userSub.productId], userSub.productId);
};
