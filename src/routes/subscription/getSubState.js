const config = require('../../../config');

module.exports = async function process(req) {
  return {
    status: 'success',
    sub: req.user.subscriber,
    subPaid: req.user.s,
    android_v: config.appVersions.android,
    ios_v: config.appVersions.ios,
    iosBuild: config.appVersions.iosBuild,
  };
};
