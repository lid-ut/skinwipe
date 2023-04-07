const User = require('../../models/User');

module.exports = async function getSpecialoffers(req, res) {
  await User.updateOne(
    { _id: req.user._id },
    {
      $set: {
        showTrialCancelledSpecialOffer: false,
        trialCancelledSpecialOfferLastChance: null,
      },
    },
  );

  res.json({ status: 'success' });
};
