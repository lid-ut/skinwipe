const fetch = require('node-fetch');
const FakeUser = require('../../models/FakeUser');
const TempFirebaseToken = require('../../models/TempFirebaseToken');
const config = require('../../../config');

module.exports = async function process(req) {
  if (!req.params.id) {
    return { status: 'error', error: { code: 3, message: 'No fake user id' } };
  }
  let user = await FakeUser.deleteOne({ _id: req.params.id });

  return { status: 'success' };
};
