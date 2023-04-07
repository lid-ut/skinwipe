const fetch = require('node-fetch');
const config = require('../../../config');
const BotSteamItem = require('../../models/BotSteamItem');
const addItemsTransactions = require('../../helpers/addItemsTransactions');

const getVirtualUserItems = async (steamId, items) => {
  return (
    await BotSteamItem.find({
      buyer: steamId,
      tradable: true,
      virtual: true,
      assetid: { $in: (items || []).map(it => it.assetid) },
    })
  ).map(it => {
    it.price.steam.mean *= 100;
    it.price.steam.safe *= 100;
    it.virtual = false;
    return it;
  });
};

const createTrades = async (user, items) => {
  let createTradeRes = {};
  const statusHook = config.botsManagerStatusHook;

  try {
    createTradeRes = await fetch(`${config.botsManagerUrl}/trade/create`, {
      method: 'post',
      body: JSON.stringify({
        sendOnly: true,
        userSteamId: user.steamId,
        userTradeUrl: user.tradeUrl,
        userItems: [],
        botItems: items,
        statusHook,
      }),
      headers: { 'Content-Type': 'application/json' },
    }).then(tradesRes => tradesRes.json());
    if (!createTradeRes.success) {
      // eslint-disable-next-line no-restricted-syntax
      return { status: 'error', error: createTradeRes.result };
    }

    // eslint-disable-next-line no-restricted-syntax,no-unused-vars
    for (const trade of createTradeRes.result.swap.trades) {
      // eslint-disable-next-line no-await-in-loop
      await addItemsTransactions(user, 'send', trade.status, trade);
    }
  } catch (e) {
    console.log(e.toString());
    return { status: 'error', error: e.toString() };
  }
  return { status: 'success', result: createTradeRes.result.swap.trades };
};

module.exports = async function createTrade(req, res) {
  const items = req.body.items;
  const virtualItems = await getVirtualUserItems(req.user.steamId, items);

  if (virtualItems.length === 0) {
    res.json({ status: 'error', error: 'user items not found' });
    return;
  }

  if (items.length === 0) {
    res.json({ status: 'error', error: 'user items not found' });
    return;
  }

  await BotSteamItem.updateMany({ assetid: { $in: virtualItems.map(it => it.assetid) } }, { $set: { withdrawn: true } });

  const result = await createTrades(req.user, virtualItems);

  res.json(result);
};
