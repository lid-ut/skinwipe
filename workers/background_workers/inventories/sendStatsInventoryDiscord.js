const fetch = require('node-fetch');
const User = require('../../../src/models/User');

module.exports = async () => {
  const forceTime = new Date(534600000000); // Force 1986!
  const users = await User.countDocuments({
    lastSteamItemsUpdate: { $lte: forceTime },
    lastSteamItemsUpdateInProgress: { $ne: true },
    $or: [{ steamItemsUpdateTries: null }, { steamItemsUpdateTries: { $lt: 4 } }],
  });

  if (users > 100) {
    await fetch(
      'https://discord.com/api/webhooks/843801677558972457/s6zdejRlQ4gaeGnQzHTDR2lrr4GMCoSq4KslPhWzw1GsbwZSGdzTbiG9rhvsy8IWzNkM',
      {
        method: 'POST',
        body: JSON.stringify({
          content: `Пользователей: ${users}`,
        }),
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};
