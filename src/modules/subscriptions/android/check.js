const User = require('../../../models/User');
const check = require('./index');

module.exports = async (user, purchase) => {
  const sub = await check(user, purchase);
  if (sub) {
    console.log(sub.data.orderId);
    const subInfo = user.subInfo.filter(it => it.purchaseToken === sub.data.purchaseToken);

    if (!subInfo) {
      // console.log(sub);
      const expirationDate = sub.data.expiration || sub.data.expirationTime || sub.data.expiresDateMs || 0;
      if (expirationDate > Date.now()) {
        user.subscriber = true;
        user.subInfo.push(sub.data);
        await user.save();
      }
    } else {
      for (let i = 0; i < user.subInfo.length; i++) {
        if (user.subInfo[i].purchaseToken === sub.data.purchaseToken) {
          user.subInfo[i] = sub.data;
        }
      }
      await User.updateOne({ _id: user._id }, { $set: { subInfo: user.subInfo } });
    }
  }
};
