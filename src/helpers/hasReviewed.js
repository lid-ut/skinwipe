const Reviews = require('../models/Reviews');

module.exports = async (to, from) => {
  return !!(await Reviews.findOne({ comment: { $ne: null }, steamId: to, 'user.steamId': from }));
};
