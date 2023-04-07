const User = require('../../src/models/User');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();

  const users = await User.find({
    gotPremiumAfterTradeBan: true,
    'subInfo.code': 'firstPremiumAfterTradeBan',
  })
    .limit(1000)
    .lean()
    .exec();

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    logger.info(`[specialOfferPush][${i + 1}/${users.length}] ${user._id} (${user.personaname}) in ${Date.now() - startTime} ms`);

    let subscription = user.subInfo.find(function (item) {
      return item.code === 'firstPremiumAfterTradeBan';
    });

    if (!subscription) {
      continue;
    }

    let hoursBeforeOfferEnd = (+subscription.expirationTime - new Date().getTime()) / (60 * 60 * 1000);
    let roundedHoursBeforeOfferEnd = null;
    if (hoursBeforeOfferEnd <= 10 && hoursBeforeOfferEnd >= 6) {
      roundedHoursBeforeOfferEnd = 10;
    } else if (hoursBeforeOfferEnd <= 6 && hoursBeforeOfferEnd >= 2) {
      roundedHoursBeforeOfferEnd = 6;
    } else if (hoursBeforeOfferEnd <= 2 && hoursBeforeOfferEnd >= 0) {
      roundedHoursBeforeOfferEnd = 2;
    }

    if (!roundedHoursBeforeOfferEnd) {
      continue;
    }

    if (
      user.notifications &&
      user.notifications.specialOffer &&
      user.notifications.specialOffer.premiumAfterTradeBan &&
      user.notifications.specialOffer.premiumAfterTradeBan[roundedHoursBeforeOfferEnd + '_hours_before'] === true
    ) {
      continue;
    }

    let message = i18n((user.locale || 'en').toLowerCase()).specialOffer.premiumAfterTradeBan[roundedHoursBeforeOfferEnd + '_hours_before'];

    // eslint-disable-next-line no-await-in-loop
    await sendPushV3(user, {
      type: 'SPECIAL_OFFER_INFO',
      title: message.title,
      content: message.content,
    });

    const notifications = user.notifications || {};
    notifications.specialOffer = notifications.specialOffer || {};
    notifications.specialOffer.premiumAfterTradeBan = notifications.specialOffer.premiumAfterTradeBan || {};
    notifications.specialOffer.premiumAfterTradeBan[roundedHoursBeforeOfferEnd + '_hours_before'] = true;
    // eslint-disable-next-line no-await-in-loop
    await User.updateOne(
      { _id: user._id },
      {
        $set: { notifications },
      },
    );
  }

  logger.info(`[specialOfferPush] end in ${Date.now() - startTime}ms`);
  callback();
};
