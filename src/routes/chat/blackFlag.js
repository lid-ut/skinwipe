const User = require('../../models/User');

module.exports = async function process(req, res) {
  if (!req.params.steamId) {
    logger.warn(`[blackFlag] error (data)`);
    res.json({ status: 'error' });
    return;
  }

  const partner = await User.findOne({ steamId: req.params.steamId });
  if (!partner) {
    logger.warn(`[blackFlag] cannot find user`);
    res.json({ status: 'error' });
    return;
  }

  if (!req.user.blacklist) {
    req.user.blacklist = [];
  }

  let blacklisted = false;
  if (req.user.blacklist.indexOf(req.params.steamId) > -1) {
    req.user.blacklist = req.user.blacklist.filter(sid => sid !== req.params.steamId);
  } else {
    req.user.blacklist.push(req.params.steamId);
    blacklisted = true;
  }
  await User.updateOne(
    { _id: req.user._id },
    {
      $set: { blacklist: req.user.blacklist },
    },
  );

  if (partner.blacklist && partner.blacklist.indexOf(req.user.steamId) > -1) {
    blacklisted = true;
  }

  res.json({ status: 'success', blacklisted });
};
