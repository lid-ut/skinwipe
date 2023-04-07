const fetch = require('node-fetch');
const FakeUser = require('../../models/FakeUser');
const TempFirebaseToken = require('../../models/TempFirebaseToken');
const config = require('../../../config');

module.exports = async function process(req) {
  if (!req.params.id) {
    return { status: 'error', error: { code: 3, message: 'No userId' } };
  }
  const user = await FakeUser.findOne({ _id: req.params.id });
  if (!user) {
    return { status: 'error', error: { code: 3, message: 'No such user' } };
  }
  user.lastActiveDate = Date.now();
  await user.save();

  if (req.body.firebaseToken) {
    await TempFirebaseToken.deleteOne({ userId: user._id });
    let token = new TempFirebaseToken({
      userId: user._id,
      token: req.body.firebaseToken,
      device: req.body.device,
      os_type: req.body.os_type,
    });
    await token.save();
  }

  return { status: 'success', result: user };
};
