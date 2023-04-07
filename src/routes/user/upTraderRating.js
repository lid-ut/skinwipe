const User = require('../../models/User');
const addPaidStat = require('../../helpers/addPaidStat');
const changeCoins = require('../../helpers/changeCoins');
const checkCoins = require('../../helpers/checkCoins');
const reportQuest = require('../../helpers/reportQuest');
const config = require('../../../config');

const upTraderRating = async (user, free) => {
  const topUser = await User.find(
    {},
    {
      traderRating: 1,
    },
  )
    .sort({ traderRating: -1 })
    .limit(1)
    .lean()
    .exec();
  if (!topUser[0]) {
    logger.error('Cannot get users from db');
    return 42;
  }
  if (!user.traderRatingFreeUpDate) {
    user.traderRatingFreeUpDate = [];
  }
  user.traderRating = topUser[0].traderRating + 5;
  if (free) {
    user.traderRatingFreeUpDate.push(new Date());
  }
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        traderRating: user.traderRating,
        traderRatingFreeUpDate: user.traderRatingFreeUpDate,
      },
    },
  );
  return user.traderRating;
};

module.exports = async req => {
  let free = true;
  if (!req.user.subscriber) {
    free = false;
    if (!(await checkCoins(req.user, 10))) {
      return {
        status: 'error',
        code: 0,
        message: 'not enough money',
      };
    }

    await addPaidStat('upUser', 10);
    await changeCoins(req.user, 'upUser', -10);
  } else {
    let blockPeriod = Date.now() - 5 * 60 * 1000;
    if (!config.production) {
      blockPeriod = Date.now() - 60 * 1000;
    }
    if (new Date(req.user.lastProfileRise).getTime() > blockPeriod) {
      return {
        status: 'error',
        code: 1,
        message: 'rate limit',
      };
    }
    await addPaidStat('upUserFree');
    await User.updateOne({ _id: req.user._id }, { $set: { lastProfileRise: Date.now() } });
  }

  const newTraderRating = await upTraderRating(req.user, free);
  await reportQuest(req.user, 'upProfile');
  return {
    status: 'success',
    message: newTraderRating,
  };
};
