// const fetch = require('node-fetch');
// const config = require('../../../config');
// const UserSteamItems = require('../../models/UserSteamItems');
// const BotSteamItem = require('../../models/BotSteamItem');
// const changeMoney = require('../../helpers/changeMoney');
// const sumMoneyTransactions = require('../../helpers/sumMoneyTransactions');
// const addItemsTransactions = require('../../helpers/addItemsTransactions');
// const getBotsItems = require('../../helpers/getBotsItems');
//
// const getInventoryUserItems = async (steamId, items) => {
//   const invs = await UserSteamItems.find({ steamId });
//
//   const foundAssetIds = [];
//   const resItems = [];
//   for (let i = 0; i < items.length; i++) {
//     const it = items[i];
//     // eslint-disable-next-line no-restricted-syntax
//     for (const inv of invs) {
//       // eslint-disable-next-line no-restricted-syntax
//       for (const item of inv.steamItems) {
//         if (it.assetid === item.assetid) {
//           if (foundAssetIds.indexOf(item.assetid) !== -1) {
//             // eslint-disable-next-line no-continue
//             continue;
//           }
//           foundAssetIds.push(item.assetid);
//           resItems.push({
//             ...it,
//             ...item,
//           });
//         }
//       }
//     }
//   }
//   return resItems;
// };
// const getVirtualUserItems = async (steamId, items) => {
//   return (
//     await BotSteamItem.find({
//       buyer: steamId,
//       withdrawn: { $ne: true },
//       virtual: true,
//       assetid: { $in: (items || []).map(it => it.assetid) },
//     })
//   ).map(it => {
//     it.price.steam.mean *= 100;
//     it.price.steam.safe *= 100;
//     return it;
//   });
// };
//
// const createTrades = async (user, userItems, botItems) => {
//   let createTradeRes = {};
//   const statusHook = config.botsManagerStatusHook;
//
//   try {
//     createTradeRes = await fetch(`${config.botsManagerUrl}/trade/create`, {
//       method: 'post',
//       body: JSON.stringify({
//         sendOnly: false,
//         subscriber: user.subscriber,
//         userSteamId: user.steamId,
//         userTradeUrl: user.tradeUrl,
//         userItems,
//         botItems,
//         statusHook,
//       }),
//       headers: { 'Content-Type': 'application/json' },
//     }).then(tradesRes => tradesRes.json());
//
//     if (!createTradeRes.success) {
//       return { status: 'error', error: createTradeRes.result };
//     }
//     // eslint-disable-next-line no-restricted-syntax,no-unused-vars
//     for (const trade of createTradeRes.result.swap.trades) {
//       // eslint-disable-next-line no-await-in-loop
//       await changeMoney(user, 'wait', trade._id, trade.difference);
//       // eslint-disable-next-line no-await-in-loop
//       await addItemsTransactions(user, 'buy', trade.status, trade);
//     }
//     await sumMoneyTransactions(user);
//   } catch (e) {
//     console.log(e.toString());
//     return { status: 'error', error: e.toString() };
//   }
//   return { status: 'success', result: createTradeRes.result.swap.trades };
// };
//
// module.exports = async function createTrade(req, res) {
//   res.json({ status: 'error', error: 'user have trade ban', code: 4 });
//
//   // if (req.user.bans && req.user.bans.TRADEBAN) {
//   //   res.json({ status: 'error', error: 'user have trade ban', code: 4 });
//   //   return;
//   // }
//   // let fee = config.fee;
//   // if (req.user.subscriber) {
//   //   fee = 1.18;
//   // }
//   //
//   // let userItems = req.body.userItems;
//   // const virtualItems = await getVirtualUserItems(req.user.steamId, userItems);
//   // const dbUserItems = await getInventoryUserItems(req.user.steamId, userItems);
//   //
//   // if (userItems.length !== dbUserItems.length + virtualItems.length) {
//   //   res.json({ status: 'error', error: 'user items not found', code: 2 });
//   //   return;
//   // }
//   //
//   // let botItems = req.body.botItems;
//   // const dbBotsItems = await getBotsItems(req.user, botItems, fee);
//   // if (dbBotsItems.length !== botItems.length) {
//   //   res.json({ status: 'error', error: 'not found bot items', code: 3 });
//   //   return;
//   // }
//   //
//   // const reservedItems = dbBotsItems.filter(it => !!it.reserver);
//   // if (reservedItems.length > 0) {
//   //   res.json({ status: 'error', message: 'items already reserved', code: 1 });
//   //   return;
//   // }
//   //
//   // let userItemsSum = 0;
//   // // eslint-disable-next-line no-restricted-syntax
//   // for (const dbUserItem of dbUserItems) {
//   //   userItemsSum += dbUserItem.price.steam.mean;
//   // }
//   // // eslint-disable-next-line no-restricted-syntax
//   // for (const virtualUserItem of virtualItems) {
//   //   userItemsSum += virtualUserItem.price.steam.mean;
//   // }
//   //
//   // let botItemsSum = 0;
//   // // eslint-disable-next-line no-restricted-syntax
//   // for (const dbBotItem of dbBotsItems) {
//   //   botItemsSum += dbBotItem.price.steam.mean;
//   // }
//   //
//   // if (!req.user.money) {
//   //   req.user.money = 0;
//   // }
//   //
//   // if (req.user.money + userItemsSum < botItemsSum) {
//   //   res.json({ status: 'error', error: 'no money', code: 4 });
//   //   return;
//   // }
//   //
//   // userItems = [];
//   // botItems = [];
//   //
//   // // eslint-disable-next-line no-restricted-syntax
//   // for (const virtualItem of virtualItems) {
//   //   userItems.push(virtualItem);
//   // }
//   //
//   // // eslint-disable-next-line no-restricted-syntax
//   // for (const dbUserItem of dbUserItems) {
//   //   userItems.push(dbUserItem);
//   // }
//   //
//   // if (userItems.length !== req.body.userItems.length) {
//   //   res.json({ status: 'error', error: 'no items', code: 4 });
//   //   return;
//   // }
//   //
//   // // eslint-disable-next-line no-restricted-syntax
//   // for (const botItem of dbBotsItems) {
//   //   botItem.reserver = req.user.steamId;
//   //   if (!botItem.tradable) {
//   //     botItem.virtual = true;
//   //   }
//   //   botItems.push(botItem);
//   // }
//   const result = await createTrades(req.user, userItems, botItems);
//   // if (result.status === 'success') {
//   //   // eslint-disable-next-line no-restricted-syntax
//   //   for (const botItem of botItems) {
//   //     // eslint-disable-next-line no-await-in-loop
//   //     await BotSteamItem.updateOne(
//   //       { _id: botItem._id },
//   //       {
//   //         $set: {
//   //           virtual: botItem.virtual,
//   //           reserver: botItem.reserver,
//   //         },
//   //       },
//   //     );
//   //   }
//   // }
//   // res.json(result);
// };
