const User = require('../../models/User');

module.exports = async function process(req) {
  await User.updateOne(
    { _id: req.user._id },
    {
      $set: {
        subInfo: [],
        subscriber: false,
      },
    },
  );
  return { status: 'success' };
};
