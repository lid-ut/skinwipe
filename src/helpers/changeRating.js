const User = require('../models/User');

module.exports = async function changeRating(steamId, rating) {
  await User.updateOne({ steamId }, { $inc: { traderRating: rating } });
};
