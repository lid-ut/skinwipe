const User = require('../../models/User');
const Message = require('../../models/Message');
const addStat = require('../../helpers/addStat');

module.exports = async function process(req, res) {
  if (!req.params || !req.params.steamId) {
    logger.warn(`[resolve] error (data)`);
    return;
  }

  await addStat('supportClosed');
  await User.updateOne({ steamId: req.params.steamId }, { $set: { supportResolved: true } });
  await Message.updateMany({ room: `support_${req.params.steamId}` }, { $set: { supportResolved: true } });

  res.json({ status: true });
};
