const User = require('../models/User');

module.exports = async function changeTraderRating(user, rating) {
  await User.updateOne({ _id: user._id }, { $inc: { traderRating: rating } });
};
