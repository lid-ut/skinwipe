const User = require('../../../src/models/User');
const Settings = require('../../../src/models/Settings');

module.exports = async () => {
  logger.info('[calculateSettings] started');
  const findTime = new Date(Date.now() - 5 * 60 * 60 * 1000);
  const online = await User.countDocuments({ lastActiveDate: { $gte: findTime } });
  const all = await User.countDocuments();
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
  balance = Math.round(balance);
  await Settings.updateMany(
    {},
    {
      $set: {
        traders: {
          online,
          all,
          balance,
        },
      },
    },
  );
};
