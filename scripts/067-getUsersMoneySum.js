require('../logger');
const User = require('../src/models/User');

(async () => {
  const users = await User.find({}, { money: 1 });

  let sum = 0;
  for (let user of users) {
    if (user.money) {
      sum += user.money;
    }
  }

  console.log('sum ' + sum);
})();
