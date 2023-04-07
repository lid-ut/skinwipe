const Feedback = require('../../models/Feedback');
const discord = require('../../../discord');

module.exports = async function process(req) {
  await new Feedback({
    steamId: req.user.steamId,
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    comment: req.body.comment,
  }).save();

  discord({ message: `[FEEDBACK][${req.body.name}] ${req.body.comment}` });
  return { status: 'success' };
};
