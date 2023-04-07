const Trade = require('../../models/Trade');
const sumMoneyTransactions = require('../../helpers/sumMoneyTransactions');
const changeTransaction = require('../../modules/money/transaction/change');

module.exports = async function process(req, res) {
  const trades = await Trade.find({
    autoTrade: { $ne: true },
    status: 'new',
    steamIdPartner: req.user.steamId,
  });

  await Trade.updateMany(
    {
      status: 'new',
      steamIdPartner: req.user.steamId,
    },
    {
      $set: {
        status: 'reject',
        userClose: req.user.steamId,
      },
    },
  );
  await Trade.updateMany(
    {
      status: 'new',
      partnersSteamIds: req.user.steamId,
      usersReject: { $ne: req.user.steamId },
    },
    {
      $push: {
        usersReject: req.user.steamId,
      },
    },
  );

  // eslint-disable-next-line no-restricted-syntax
  for (const trade of trades) {
    // eslint-disable-next-line no-await-in-loop
    await changeTransaction(trade._id, 'close', 'decline all trades');

    // eslint-disable-next-line no-await-in-loop
    await sumMoneyTransactions({ steamId: trade.steamId });
  }

  res.json({
    status: 'success',
  });
};
