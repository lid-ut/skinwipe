require('../../../logger');
const purchaseService = require('in-app-purchase');
const config = require('../../../config');
const User = require('../../../src/models/User');
const sendPushV3 = require('../../../src/helpers/sendPushV3');
const i18n = require('../../../src/languages');

purchaseService.config(config.iap.settings);

module.exports = async callback => {
  await purchaseService.setup();

  const users = await User.find({
    'subInfo.0': { $exists: true },
    showTrialCancelledSpecialOffer: { $ne: true },
  });

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    for (let j = 0; j < user.subInfo.length; j++) {
      const subscription = user.subInfo[j];
      //
      // if (
      //   !subscription.JSONdata ||
      //   !subscription.signature ||
      //   subscription.checkSubscriptionError === true ||
      //   ['com.mezmeraiz.skinswipe.premium1m.trial7', 'com.mezmeraiz.skinswipe.premium12m.trial14'].indexOf(subscription.productId) === -1
      // ) {
      //   // eslint-disable-next-line no-continue
      //   continue;
      // }

      // if (
      //   subscription.productId === 'com.mezmeraiz.skinswipe.premium1m.trial3' &&
      //   subscription.startTimeMillis + 3 * 24 * 60 * 60 * 1000 < +new Date()
      // ) {
      //   // eslint-disable-next-line no-continue
      //   continue;
      // }
      //
      // if (
      //   subscription.productId === 'com.mezmeraiz.skinswipe.premium12m.trial7' &&
      //   subscription.startTimeMillis + 7 * 24 * 60 * 60 * 1000 < +new Date()
      // ) {
      //   // eslint-disable-next-line no-continue
      //   continue;
      // }

      let lastChanceDate = parseInt(subscription.startTimeMillis) + 3 * 24 * 60 * 60 * 1000;
      if (subscription.productId === 'com.mezmeraiz.skinswipe.premium1m.trial3') {
        lastChanceDate = parseInt(subscription.startTimeMillis) + 3 * 24 * 60 * 60 * 1000;
      }
      if (subscription.productId === 'com.mezmeraiz.skinswipe.premium12m.trial7') {
        lastChanceDate = parseInt(subscription.startTimeMillis) + 7 * 24 * 60 * 60 * 1000;
      }

      const receipt = {
        data: subscription.JSONdata,
        signature: subscription.signature,
      };

      try {
        // eslint-disable-next-line no-await-in-loop
        const validatedData = await purchaseService.validate(receipt);
        console.log(`Check user trial subscription for ${user.personaname} (${user.steamId})`);
        if (validatedData.cancelReason !== undefined) {
          if (user.showTrialCancelledSpecialOffer !== false) {
            // eslint-disable-next-line no-await-in-loop
            await User.updateOne(
              { _id: user._id },
              {
                showTrialCancelledSpecialOffer: true,
                trialCancelledSpecialOfferLastChance: new Date(lastChanceDate),
              },
            );
            // eslint-disable-next-line no-await-in-loop
            await sendPushV3(user, {
              type: 'INFO',
              title: i18n((user.locale || 'en').toLowerCase()).inactiveUser.twoDaysAfterInactive.title,
              content: i18n((user.locale || 'en').toLowerCase()).inactiveUser.twoDaysAfterInactive.content,
            });
          }
        }
      } catch (error) {
        console.log('[checkSubscriptions] error: ', error);
        subscription.checkSubscriptionError = true;
        user.subInfo[j] = subscription;
        // eslint-disable-next-line no-await-in-loop
        await User.updateOne({ _id: user._id }, { subInfo: user.subInfo });
      }
    }
  }

  callback();
};
