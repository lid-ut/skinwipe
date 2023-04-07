const FirebaseToken = require('../../models/FirebaseToken');

module.exports = async function setAnonFirebaseToken(req) {
  await FirebaseToken.deleteMany({ token: req.body.firebaseToken });
  await new FirebaseToken({
    steamId: 'anonymous',
    ipAddress: req.ipAddress,
    device: req.body.device,
    token: req.body.firebaseToken,
    os_type: req.body.os_type,
    locale: req.body.locale,
  }).save();
  return { status: 'success' };
};
