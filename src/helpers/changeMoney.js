module.exports = async function changeMoney(user, type, direction, status, token, amount) {
  let transaction = await Transactions.findOne({
    where: {
      steamId: user.steamId,
      amount,
      token: token.toString(),
    },
  });

  if (!transaction) {
    transaction = await Transactions.create({
      steamId: user.steamId,
      status,
      type,
      direction,
      amount,
      token: token.toString(),
      balance: user.money,
    });
  } else {
    await Transactions.update({ status }, { where: { steamId: user.steamId, token: token.toString() } });
  }
  return transaction;
};
