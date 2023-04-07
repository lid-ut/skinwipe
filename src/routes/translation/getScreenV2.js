const AppStrings = require('../../models/AppStrings');

module.exports = async function process(req) {
  if (['en', 'ru'].indexOf(req.params.locale) === -1) {
    req.params.locale = 'en';
  }
  const appstring = await AppStrings.findOne({
    screenId: req.params.screen,
    locale: req.params.locale,
    platform: req.params.platform,
  });
  return { success: true, appstring };
};
