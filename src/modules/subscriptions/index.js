const validateAndroid = require('./android');
const validateIOS = require('./ios');
const validateIOSRevenueCat = require('./ios/revenuecat');

module.exports = async function validateSub(user, sub) {
  if (sub.store === 'android' || sub.os === 'Android') {
    return validateAndroid(user, sub);
  }
  if (sub.store === 'apple') {
    return validateIOS(user, sub);
  }
  if (sub.store === 'apple_revenue_cat') {
    return validateIOSRevenueCat(user, sub);
  }
  return sub;
};
