const User = require('../../models/User');

module.exports = async function process(req) {
  const user = await User.findOne({ _id: req.user._id }).lean();
  if (!user) {
    // res.status(500).json();
    return { status: 'error', code: 1 };
  }
  if (user.locale !== req.body.locale) {
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          locale: `${req.body.locale || 'en'}`.toLowerCase(),
        },
      },
    );
  }
  if (!user.devices) {
    user.devices = [];
  }
  const deviceIndex = user.devices.findIndex(device => device.model === req.body.model || 'some_model');
  if (deviceIndex === -1) {
    user.devices.push({
      os: req.body.os || 'some_os',
      os_version: req.body.os_version || 'some_os_version',
      model: req.body.model || 'some_model',
      locale: req.body.locale || 'some_locale',
      app_version: req.body.app_version || req.body.appVersion || 'some_app_version',
    });
  } else if (user.devices[deviceIndex]) {
    user.devices[deviceIndex].app_version = req.body.app_version || req.body.appVersion || 'some_app_version';
    user.devices[deviceIndex].locale = req.body.locale || 'some_locale';
    user.devices[deviceIndex].os_version = req.body.os_version || 'some_os_version';
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        devices: user.devices,
      },
    },
  );
  return { status: 'success' };
};
