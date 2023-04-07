const User = require('../models/User');
const validateSub = require('../modules/subscriptions');

const isSubscriptionIsNotExpired = subInfo => {
  const expirationDate = subInfo.expiration || subInfo.expirationTime || subInfo.expiresDateMs || 0;
  return expirationDate > Date.now();
};

const resumeChecks = async user => {
  if (!user.subInfo) {
    user.subInfo = [];
  }

  const subInfo = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const sub of user.subInfo) {
    // eslint-disable-next-line no-await-in-loop
    subInfo.push(await validateSub(user, sub));
  }
  user.subInfo = subInfo.filter(sub => sub !== null).filter(isSubscriptionIsNotExpired);

  const update = {
    subInfo: user.subInfo,
    subscriber: user.subInfo.length > 0,
  };
  if (!user.oldBlackListedItems) {
    user.oldBlackListedItems = [];
  }
  if (user.subInfo.length === 0) {
    update.oldBlackListedItems = user.blackListedItems;
    update.blackListedItems = [];
  } else if (user.oldBlackListedItems.length > 0 && user.blackListedItems.length === 0) {
    update.blackListedItems = user.oldBlackListedItems;
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: update,
    },
  );
};

module.exports = async function checkSubInfo(user) {
  if (!user.subInfo) {
    user.subInfo = [];
  }

  // const newSubInfo = user.subInfo.filter(isSubscriptionIsNotExpired);
  // console.log(newSubInfo);
  // if (newSubInfo.length !== user.subInfo.length || (!user.subInfo.length && user.subscriber) || (user.subInfo.length && !user.subscriber)) {
  await resumeChecks(user);
  // const newUser = await User.findOne({ _id: user._id });
  // return newUser.subInfo.length > 0;
  // }
  // return newSubInfo.length > 0;
};
