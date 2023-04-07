const revenue = require('../../modules/subscriptions/ios/revenuecat/check');

module.exports = async function process(req) {
  await revenue(req.user);
  return { status: 'success' };
};
