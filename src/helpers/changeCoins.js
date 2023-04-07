const sendPushV3 = require('./sendPushV3');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const FireCoin = require('../models/FireCoin');
const addStat = require('./addStat');

async function addTransaction(steamId, amount, info, token, entity) {
  const transaction = new Transaction({
    user_steam_id: steamId,
    usedEntity: entity,
    info,
    amount,
    token,
  });
  await transaction.save();
}

async function addCoins(user, purchaseToken, count) {
  await addTransaction(user.steamId, count, `Пополнение на ${count}`, purchaseToken, 'coins');

  if (!user.coinCount) {
    user.coinCount = 0;
  }
  user.coinCount += count;

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        coinCount: user.coinCount,
      },
    },
  );

  await sendPushV3(user, { type: 'UPDATE_BALANCE' });
}

async function revokeCoins(user, purchaseToken, count) {
  const fireCoins = await FireCoin.find({
    steamId: user.steamId,
    expiration: { $gte: Date.now() },
  });

  const fireCoinsCount = fireCoins.reduce((sum, cur) => (sum || 0) + cur.amount - cur.used, 0);
  if (fireCoinsCount > 0) {
    for (let i = 0; i < fireCoins.length; i++) {
      const doc = fireCoins[i];
      const fireCoinsLeft = doc.amount - doc.used;
      if (fireCoinsLeft > 0) {
        if (fireCoinsLeft >= count) {
          // eslint-disable-next-line no-await-in-loop
          await addStat('fireCoinsRevoked', count);
          // eslint-disable-next-line no-await-in-loop
          await addTransaction(user.steamId, count * -1, `Списание ${count}`, purchaseToken, 'fireCoins');
          // eslint-disable-next-line no-await-in-loop
          await FireCoin.updateOne({ _id: doc._id }, { $set: { used: doc.used + count } });
          // eslint-disable-next-line no-await-in-loop
          await sendPushV3(user, { type: 'UPDATE_BALANCE' });
          return;
        }
        // eslint-disable-next-line no-await-in-loop
        await addStat('fireCoinsRevoked', fireCoinsLeft);
        // eslint-disable-next-line no-await-in-loop
        await addTransaction(user.steamId, fireCoinsLeft * -1, `Списание ${fireCoinsLeft}`, purchaseToken, 'fireCoins');
        count -= fireCoinsLeft;
        // eslint-disable-next-line no-await-in-loop
        await FireCoin.updateOne({ _id: doc._id }, { $set: { used: doc.amount } });
      }
    }
  }

  if (count === 0) {
    await sendPushV3(user, { type: 'UPDATE_BALANCE' });
    return;
  }
  await addTransaction(user.steamId, count * -1, `Списание ${count}`, purchaseToken, 'coins');
  await addStat('coinsRevoked', count);

  if (!user.coinCount) {
    user.coinCount = 0;
  }
  user.coinCount -= count;

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        coinCount: user.coinCount,
      },
    },
  );

  await sendPushV3(user, { type: 'UPDATE_BALANCE' });
}

module.exports = async function changeCoins(user, purchaseToken, count) {
  if (count > 0) {
    await addCoins(user, purchaseToken, count);
    await addStat('coinsAdded', count);
  } else {
    await revokeCoins(user, purchaseToken, count * -1);
  }
};
