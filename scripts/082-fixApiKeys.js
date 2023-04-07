require('../logger');
const User = require('../src/models/User');

(async () => {
  const users = await User.find({ apiKey: null, oldApiKey: { $ne: null } });

  for (const user of users) {
    await User.updateOne({ _id: user._id }, { $set: { apiKey: user.oldApiKey } });
  }
  console.log('done');
})();
