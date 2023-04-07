const User = require('../../../models/User');
const check = require('./index');

module.exports = async (user, purchase) => {
  const sub = await check(user, purchase);
  if (sub) {
    // eslint-disable-next-line no-restricted-syntax
    for (const data of sub.data) {
      const subInfo = user.subInfo.filter(it => it.transactionId === data.transactionId)[0];
      if (!subInfo) {
        // console.log(sub);
        const expirationDate = data.expiration || data.expirationTime || data.expiresDateMs || 0;
        if (expirationDate > Date.now()) {
          user.subInfo.push(data);
          // eslint-disable-next-line no-await-in-loop
          await User.updateOne({ _id: user._id }, { $set: { subscriber: true, subInfo: user.subInfo } });
        }
      } else {
        for (let i = 0; i < user.subInfo.length; i++) {
          if (user.subInfo[i].transactionId === data.transactionId) {
            user.subInfo[i] = data;
          }
        }
        // eslint-disable-next-line no-await-in-loop
        await User.updateOne({ _id: user._id }, { $set: { subInfo: user.subInfo } });
      }
    }
  }
};
