const User = require('../../../src/models/User');

module.exports = async () => {
  const time = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  await User.updateMany({ lastActiveDate: { $lt: time } }, { $set: { traderRating: -20000 } });
};
