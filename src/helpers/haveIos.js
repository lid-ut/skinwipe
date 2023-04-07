const User = require('../models/User');

module.exports = async steamId => {
  if (!steamId) return false;
  const user = await User.findOne({ steamId });
  if (!user) return false;
  if (!user.devices) return true;
  if (user.devices.length === 0) return true;
  return !!user.devices.find(it => it.os === 'iOS');
};
