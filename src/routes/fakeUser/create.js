const fetch = require('node-fetch');
const FakeUser = require('../../models/FakeUser');
const TempFirebaseToken = require('../../models/TempFirebaseToken');
const config = require('../../../config');

module.exports = async function process(req) {
  if (!req.body.firebaseToken || !req.body.device || !req.body.os_type) {
    return { status: 'error', error: { code: 3, message: 'No firebaseToken, device or os_type' } };
  }
  let user = new FakeUser();
  await user.save();

  let token = new TempFirebaseToken({
    userId: user._id,
    token: req.body.firebaseToken,
    device: req.body.device,
    os_type: req.body.os_type,
  });
  await token.save();

  return { status: 'success', result: user };
};
