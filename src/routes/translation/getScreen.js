const AppStrings = require('../../models/AppStrings');

module.exports = async function process(req) {
  if (['en', 'ru'].indexOf(req.body.locale) === -1) {
    req.body.locale = 'en';
  }
  if (['PREMIUM_ALL', 'COINS_ALL'].indexOf(req.body.screen) === -1) {
    return { success: false, message: 'invalid screen (PREMIUM_ALL or COINS_ALL expected)' };
  }
  if (['ANDROID', 'IOS'].indexOf(req.body.platform) === -1) {
    return { success: false, message: 'invalid platform (IOS or ANDROID expected)' };
  }
  const appstring = await AppStrings.findOne({
    screenId: req.body.screen,
    locale: req.body.locale,
    platform: req.body.platform,
  });
  return { success: true, appstring };
};
