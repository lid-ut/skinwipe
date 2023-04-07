const fetch = require('node-fetch');

const User = require('../../../../models/User');
const Purchase = require('../../../../models/Purchase');

const config = require('../../../../../config');

const addPurchase = async (user, sub, key) => {
  let purchase = await Purchase.findOne({
    steamId: user.steamId,
    'data.purchase_date': new Date(sub.purchase_date).getTime(),
    'data.productId': key,
  });
  if (!purchase) {
    let status = 'paid';
    if (sub.period_type !== 'normal') {
      status = 'trial';
    }

    purchase = new Purchase({
      steamId: user.steamId,
      status,
      token: 'revenue_cat',
      JSONdata: '',
      signature: '',
      data: {
        is_sandbox: sub.is_sandbox,
        orderId: '',
        productId: key,
        cancelReason: !!sub.unsubscribe_detected_at,
        purchase_date: new Date(sub.purchase_date).getTime(),
        service: 'apple',
        expirationTime: new Date(sub.expires_date).getTime(),
        start: new Date(sub.purchase_date).getTime(),
        expiration: new Date(sub.expires_date).getTime(),
      },
      success: true,
      iapErrors: [],
    });

    await purchase.save();
  }

  if (user.subInfo.filter(it => it.productId === key)) {
    user.subInfo.push({
      createdAt: new Date(sub.purchase_date),
      productId: key,
      store: 'apple_revenue_cat',
      isTrial: sub.period_type !== 'normal',
      purchaseDate: new Date(sub.purchase_date),
      purchaseDateMs: new Date(sub.purchase_date).getTime(),
      start: new Date(sub.purchase_date).getTime(),
      expiration: new Date(sub.expires_date).getTime(),
      expirationDate: new Date(sub.expires_date).getTime(),
    });
  }
  // eslint-disable-next-line no-await-in-loop
  await User.updateOne({ _id: user._id }, { $set: { subscriber: true, subInfo: user.subInfo } });
};

module.exports = async user => {
  const url = `https://api.revenuecat.com/v1/subscribers/${user.steamId}`;
  const options = {
    method: 'GET',
    headers: {
      'X-Platform': 'ios',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.revenueCat.ios}`,
    },
  };

  const res = await fetch(url, options);
  const json = await res.json();

  console.log(json);

  // eslint-disable-next-line no-restricted-syntax,guard-for-in
  for (const key in json.subscriber.subscriptions) {
    const sub = json.subscriber.subscriptions[key];

    console.log(sub);
    if (new Date(sub.expires_date).getTime() > Date.now()) {
      // eslint-disable-next-line no-await-in-loop
      await addPurchase(user, sub, key);
    }
  }
};
