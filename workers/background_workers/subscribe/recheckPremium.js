const User = require('../../../src/models/User');
const checkSubInfo = require('../../../src/helpers/checkSubInfo');

module.exports = async () => {
  console.log('re check prem');
  const users = await User.find({
    subscriber: true,
  });

  console.log(users.length);
  let i = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const user of users) {
    i++;
    console.log(`user ${i}`);
    // eslint-disable-next-line no-await-in-loop
    await checkSubInfo(user);
  }
  console.log('done');
};
