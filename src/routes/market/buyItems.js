const User = require('../../models/User');
const BotSteam = require('../../models/BotSteam');
const MarketItem = require('../../models/MarketItem');
const createMarketTradeBuy = require('../../modules/market/trade/buy');
const createMarketTradesBot = require('../../modules/market/trade/bot');
const createMarketTradesCSGOTM = require('../../modules/market/trade/csgotm');
const changeMoney = require('../../helpers/changeMoney');
const sumMoneyTransactions = require('../../helpers/sumMoneyTransactions');
const Settings = require('../../models/Settings');
const checkApiKey = require('../../modules/steam/checkApiKey');
const createSteamTrades = require('../../modules/steam/createSteamTrades');

const blockItems = async itemsAssetIds => {
  const items = await MarketItem.find({
    assetid: { $in: itemsAssetIds },
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    if (item.blocked) {
      return false;
    }
  }

  await MarketItem.updateMany(
    {
      assetid: { $in: itemsAssetIds },
    },
    {
      $set: {
        blocked: true,
      },
    },
  );

  return true;
};
const unblockItems = async itemsAssetIds => {
  await MarketItem.updateMany(
    {
      assetid: { $in: itemsAssetIds },
    },
    {
      $set: {
        blocked: false,
      },
    },
  );
};

module.exports = async (req, res) => {
  const blocked = await blockItems(req.body.items.map(it => it.assetid));
  if (!blocked) {
    res.json({
      status: 'error',
      code: 1,
      message: 'items already reserved',
    });
    return;
  }

  try {
    const setting = await Settings.findOne();

    req.user.money = await sumMoneyTransactions(req.user);
    if (req.user.bans && !!req.user.bans.TRADEBAN) {
      await unblockItems(req.body.items.map(it => it.assetid));
      res.json({
        status: 'error',
        code: 2,
        message: 'trade ban',
      });
      return;
    }

    const items = await MarketItem.find({
      assetid: { $in: req.body.items.map(it => it.assetid) },
    });

    // eslint-disable-next-line no-restricted-syntax
    for (const item of items) {
      if (item.type === 'csgotm') {
        // eslint-disable-next-line no-continue
        continue;
      }
      // eslint-disable-next-line no-await-in-loop
      let seller = await User.findOne({ steamId: item.steamid });
      if (item.type === 'bot') {
        // eslint-disable-next-line no-await-in-loop
        seller = await BotSteam.findOne({ steamid: item.steamid });
      }

      if (!seller || !seller.apiKey) {
        item.visible = false;
        // eslint-disable-next-line no-await-in-loop
        await item.save();
        // eslint-disable-next-line no-await-in-loop
        await unblockItems(req.body.items.map(it => it.assetid));
        res.json({
          status: 'error',
          code: 3,
          message: 'The seller not have api key',
        });
        return;
      }

      if (item.type === 'user') {
        // eslint-disable-next-line no-await-in-loop
        const result = await checkApiKey(seller.apiKey);
        if (!result) {
          // eslint-disable-next-line no-await-in-loop
          await MarketItem.deleteOne({ _id: item._id });
          // eslint-disable-next-line no-await-in-loop
          await unblockItems(req.body.items.map(it => it.assetid));
          res.json({
            status: 'error',
            code: 3,
            message: 'The seller not have api key',
          });
          return;
        }
      }

      if (item.type === 'user' && item.userAttempts && item.userAttempts.length === 6) {
        // eslint-disable-next-line no-await-in-loop
        await MarketItem.deleteOne({ _id: item._id });
        // eslint-disable-next-line no-await-in-loop
        await unblockItems(req.body.items.map(it => it.assetid));
        res.json({
          status: 'error',
          code: 4,
          message: 'The seller cannot accept the offer',
        });
        return;
      }
    }

    let amount = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const item of items) {
      amount += item.price.steam.mean;
    }
    if (!req.user.money) {
      req.user.money = 0;
    }
    if (req.user.money < amount) {
      await unblockItems(req.body.items.map(it => it.assetid));
      res.json({
        status: 'error',
        code: 5,
        message: 'no money',
      });
      return;
    }

    const usersItems = items.filter(it => it.type === 'user');
    // eslint-disable-next-line no-restricted-syntax
    for (const item of usersItems) {
      if (item.reserver) {
        // eslint-disable-next-line no-await-in-loop
        await unblockItems(req.body.items.map(it => it.assetid));
        res.json({
          status: 'error',
          code: 1,
          message: 'items already reserved',
        });
        return;
      }
    }
    const botItems = items.filter(it => it.type === 'bot');
    const csgotmItems = items.filter(it => it.type === 'csgotm');
    // eslint-disable-next-line no-restricted-syntax
    for (const item of botItems) {
      if (item.reserver) {
        // eslint-disable-next-line no-await-in-loop
        await unblockItems(req.body.items.map(it => it.assetid));
        res.json({
          status: 'error',
          code: 1,
          message: 'items already reserved',
        });
        return;
      }
    }
    const userGroup = [];
    for (let i = 0; i < usersItems.length; i++) {
      const item = usersItems[i];
      const group = userGroup.filter(it => it.steamId === item.steamid)[0];
      if (group) {
        group.items.push(item);
      } else {
        userGroup.push({
          steamId: item.steamid,
          items: [item],
        });
      }
    }

    let trades = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const group of userGroup) {
      // eslint-disable-next-line no-await-in-loop
      trades.push(await createMarketTradeBuy(req.user, group.items, 'user'));
    }

    const botsTrades = await createMarketTradesBot(req.user, botItems);
    const csgotmTrades = await createMarketTradesCSGOTM(req.user, csgotmItems);
    trades = trades
      .concat(botsTrades)
      .concat(csgotmTrades)
      .filter(it => !!it);

    // eslint-disable-next-line no-restricted-syntax
    for (const trade of trades) {
      // eslint-disable-next-line no-await-in-loop
      let sellerSum = 0;
      let buyerSum = 0;

      // eslint-disable-next-line no-restricted-syntax
      for (const item of trade.itemsPartner) {
        sellerSum += item.price.steam.mean;
        buyerSum -= item.price.steam.mean;
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const item of trade.items) {
        buyerSum += item.price.steam.mean;
      }

      // eslint-disable-next-line no-await-in-loop,no-await-in-loop
      const seller = await User.findOne({ steamId: trade.seller });
      // eslint-disable-next-line no-await-in-loop
      const buyer = await User.findOne({ steamId: trade.buyer });

      let type = 'buy_market_p2p';
      if (trade.type === 'bot') {
        type = trade.virtual ? 'buy_market_bot_virtual' : 'buy_market_bot';
      }
      if (trade.type === 'csgotm') {
        type = 'buy_market_csgotm';
      }
      // eslint-disable-next-line no-await-in-loop
      await changeMoney(buyer, type, 'out', trade.virtual ? 'done' : 'wait', trade._id, buyerSum);

      if (seller && trade.type === 'user') {
        let fee = setting.market.fee;
        if (seller.subscriber) {
          fee = setting.market.feePremium;
        }

        let amountFee = (sellerSum * fee) / 100;
        if (amountFee < 1) {
          amountFee = 1;
        }
        // eslint-disable-next-line no-await-in-loop
        await changeMoney(seller, 'sell_market_p2p', 'out', 'new', trade._id, sellerSum);
        // eslint-disable-next-line no-await-in-loop
        await changeMoney(seller, 'sell_market_p2p_fee', 'out', 'new', trade._id, amountFee * -1);

        // eslint-disable-next-line no-await-in-loop
        await sumMoneyTransactions(seller);
      }

      // eslint-disable-next-line no-await-in-loop
      await sumMoneyTransactions(buyer);
    }

    await unblockItems(req.body.items.map(it => it.assetid));

    if (req.body.web) {
      res.json({
        status: 'success',
        result: trades,
      });
      return;
    }
    const realTrades = trades.filter(it => !it.virtual && it.type !== 'csgotm');
    res.json({
      status: 'success',
      result: realTrades,
    });
  } catch (e) {
    console.log(e);
    await unblockItems(req.body.items.map(it => it.assetid));
    res.json({
      status: 'error',
      code: 1,
      message: 'items already reserved',
    });
  }
};
