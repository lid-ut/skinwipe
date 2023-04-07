require('../logger');
const User = require('../src/models/User');
const changeCoins = require('../src/helpers/changeCoins');

const processUser = async function(user) {
  console.log('coinCount:', user.coinCount);
  if (user.faqCoinsSent) {
    return;
  }
  await User.updateOne({ steamId: user.steamId }, { $set: { faqCoinsSent: true } });
  await changeCoins(user, 'faq', 50);
};

const steamId = '76561198054035851'; // rtf6x
User.findOne(
  {
    steamId,
  },
  {
    steamId: 1,
    personaname: 1,
    coinCount: 1,
    faqCoinsSent: 1,
  },
).then(async user => {
  await processUser(user);
  logger.info('Done!');
  process.exit(1);
});
