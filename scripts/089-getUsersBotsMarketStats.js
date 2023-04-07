require('../logger');
// const User = require('../src/models/User');
const User = require('../src/models/User');

(async () => {
  const balances = await User.find(
    {
      money: { $gt: 0 },
      steamId: { $nin: ['76561198116084988', '76561198096627079', '76561198114352036'] },
    },
    { money: 1 },
  );
  let balance = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const balanceCur of balances) {
    balance += balanceCur.money;
  }
  console.log(balance);
})();
