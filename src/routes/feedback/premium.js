const Feedback = require('../../models/Feedback');
const discord = require('../../../discord');

module.exports = async function process(req) {
  await new Feedback({
    type: 'premium',
    steamId: req.user.steamId,
    comment: req.body.code,
  }).save();

  discord({ message: `[FEEDBACK][PREMIUM][${req.body.name || req.user.steamId}] ${req.body.comment || req.body.code}` });
  return { status: 'success' };
};
