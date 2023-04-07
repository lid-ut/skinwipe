const FirebaseToken = require('../../models/FirebaseToken');

module.exports = async function setFirebaseToken(req) {
  await FirebaseToken.deleteMany({ token: req.body.firebaseToken });
  await FirebaseToken.deleteMany({ device: req.body.device });
  await new FirebaseToken({
    steamId: (req.user || { steamId: 'anonymous' }).steamId,
    ipAddress: req.ipAddress,
    device: req.body.device,
    token: req.body.firebaseToken,
    os_type: req.body.os_type,
  }).save();
  return { status: 'success' };
};
