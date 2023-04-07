const Settings = require('../../models/Settings');

module.exports = async function process(req, res) {
  const settings = await Settings.findOne().lean();
  if (!settings) {
    res.json({
      status: 'error',
      result: 'not found settings',
    });
    return;
  }

  if (parseInt(req.appVersion, 10) < 171) {
    settings.market.instantSell = false;
  }
  const appVersion = req.appVersion;

  if (appVersion.indexOf('2.13.') !== -1) {
    if (parseInt(appVersion.replace('2.13.', ''), 10) < 19) {
      settings.market.all = false;
      settings.market.premium = false;
    }
  }

  res.json({
    status: 'success',
    result: settings,
  });
};
