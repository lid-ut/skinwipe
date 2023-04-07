const User = require('../../models/User');

module.exports = async function addFriend(req) {
  const partner = await User.findOne({ steamId: req.params.steamId });
  if (!partner) {
    return { status: 'error', code: 0, message: 'partner not found' };
  }

  return { status: 'success', tradeUrl: partner.tradeUrl };
};
