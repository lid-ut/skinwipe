const User = require('../models/User');

module.exports = async function givePremium(user, code, months, transactionId = null) {
  if (!user.subInfo) {
    user.subInfo = [];
  }
  let startTime = Date.now();
  for (let i = 0; i < user.subInfo.length; i++) {
    const subExpiration = parseInt(user.subInfo[i].expiration || user.subInfo[i].expirationTime || user.subInfo[i].expiresDateMs, 10);
    if (subExpiration > startTime) {
      startTime = subExpiration;
    }
  }
  user.subInfo.push({
    code,
    subType: 'backend',
    store: 'backend',
    token: `backend-${user.steamId}-${code}`,
    dateCreate: new Date(),
    screen: 'no screen',
    productId: 'backend_skinswipe',
    transactionId,
    originalTransactionId: null,
    purchaseDate: Date.now(),
    purchaseDateMs: Date.now(),
    startTime: new Date(startTime).getTime(),
    expirationTime: new Date(new Date(startTime).setMonth(new Date(startTime).getMonth() + months)).getTime(),
    start: new Date(startTime).getTime(),
    expiration: new Date(new Date(startTime).setMonth(new Date(startTime).getMonth() + months)).getTime(),
  });
  user.subscriber = true;
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        subInfo: user.subInfo,
        subscriber: user.subscriber,
      },
    },
  );
};
