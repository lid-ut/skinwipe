const Auction = require('../../models/Auction');
const User = require('../../models/User');

module.exports = async function process(req, res) {
  if (!req.params || !req.params.steamId) {
    logger.warn(`[makeTop] error (data)`);
    return;
  }

  const user = await User.findOne({ steamId: req.params.steamId });
  if (!user) {
    logger.warn(`[makeTop] cannot find user`);
    res.json({ status: false });
    return;
  }

  await Auction.updateMany(
    { status: 'open', steamId: user.steamId },
    {
      $set: { dateCreate: new Date() },
    },
  );

  const topUser = await User.find({}, { traderRating: 1 })
    .sort({ traderRating: -1 })
    .limit(1)
    .lean()
    .exec();

  if (!topUser || !topUser[0]) {
    res.json({ status: user.traderRating });
    return;
  }

  user.traderRating = topUser[0].traderRating + 5;
  await User.updateOne({ _id: user._id }, { $set: { traderRating: user.traderRating } });

  res.json({ status: user.traderRating });
};
