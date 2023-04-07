const ObjectId = require('mongoose').Types.ObjectId;
const Trade = require('../../models/Trade');
const UserNews = require('../../models/UserNews');
const User = require('../../models/User');
const Settings = require('../../models/Settings');
const Auction = require('../../models/Auction');
const getUserItemsArray = require('../../helpers/getUserItemsArray');
const addSkinToUserRecommendation = require('../../helpers/addSkinToUserRecommendation');
const getSteamItem = require('../../helpers/getSteamItem');
const getSteamIdsByItemName = require('../../helpers/getSteamIdsByItemName');
const changeRating = require('../../helpers/changeRating');
const reportQuest = require('../../helpers/reportQuest');
const changeMoney = require('../../helpers/changeMoney');
const haveIos = require('../../helpers/haveIos');
const sumMoneyTransactions = require('../../helpers/sumMoneyTransactions');
const sendPushV3 = require('../../helpers/sendPushV3');
const i18n = require('../../languages');
const generateUnicCode = require('../../helpers/generateUnicCode');

const config = require('../../../config');
const checkApiKey = require('../../modules/steam/checkApiKey');

const createSuperTrade = async ({ user, money, paid, code, premium, steamId, myItemsAssetIds, hisItemsNames }) => {
  if (myItemsAssetIds.length > 20) {
    return {
      status: 'error',
      code: 12,
      message: 'too many items',
    };
  }
  let myItems = await getUserItemsArray(user.steamId);
  myItems = myItems.filter(item => myItemsAssetIds.indexOf(item.assetid) !== -1 && item.tradable);

  const steamItem = await getSteamItem(hisItemsNames);

  if (!steamItem) {
    logger.error('[trade][create][super] some items are not found (steamItems)');
    return {
      status: 'error',
      code: 13,
      message: 'some items were not found (steamItems)',
    };
  }
  if (myItems.length !== myItemsAssetIds.length) {
    logger.error('[trade][create][super] some items are not found (myItems)');
    return {
      status: 'error',
      code: 14,
      message: 'some items were not found (myItems)',
    };
  }
  let myItemsPrice = 0;
  for (let i = 0; i < myItems.length; i++) {
    myItemsPrice += myItems[i].price.steam.safe;
  }

  const countTrades = await Trade.countDocuments({
    close: { $ne: true },
    status: 'new',
    'itemsPartner.name': steamItem.name,
    steamId,
  });
  if (countTrades >= 50) {
    return {
      status: 'error',
      code: 15,
      message: 'have 5 trades for this item',
    };
  }

  const trades = await Trade.find({
    status: 'new',
    close: { $ne: true },
    'items.assetid': { $in: myItemsAssetIds },
    'itemsPartner.name': steamItem.name,
    steamId,
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const trade of trades) {
    let found = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const item of trade.items) {
      if (myItemsAssetIds.indexOf(item.assetid) !== -1) {
        found++;
      }
    }
    if (found === myItemsAssetIds.length) {
      return {
        status: 'error',
        code: 16,
        message: 'duplicated trade',
      };
    }
  }

  await addSkinToUserRecommendation(steamId, steamItem.appid, null, steamItem.market_hash_name);

  const partnersSteamIds = await getSteamIdsByItemName(steamItem.name, user.steamId);
  const newTrade = new Trade({
    steamId,
    code,
    user1: user._id,
    autoTrade: true,
    money,
    partnersSteamIds,
    usersReject: [],
    myAllSkinsPrice: Math.round(myItemsPrice),
    hisAllSkinsPrice: Math.round(steamItem.price.steam.mean),
    difference: Math.round(myItemsPrice) - Math.round(steamItem.price.steam.mean),
    items: myItems,
    itemsPartner: [steamItem],
    status: 'new',
    close: false,
    premium: premium || user.subscriber,
    paid,
    datecreate: Date.now(),
    dates: {
      created: new Date(),
    },
  });
  if (money) {
    if (user.money < money) {
      return { status: 'error' };
    }
    const setting = await Settings.findOne({});
    let amountFee = (money * setting.fee) / 100;
    if (amountFee < 1) {
      amountFee = 1;
    }
    // eslint-disable-next-line no-await-in-loop
    await changeMoney(user, 'buy_supertrade_p2p', 'out', 'wait', newTrade._id, -1 * (money - amountFee));
    // eslint-disable-next-line no-await-in-loop
    await changeMoney(user, 'buy_supertrade_p2p_fee', 'out', 'wait', newTrade._id, amountFee * -1);
    await sumMoneyTransactions(user);
  }
  await newTrade.save();
  await UserNews.create(newTrade.steamId, 'trade', newTrade);
  await changeRating(user.steamId, config.ratingSettings.superTradeCreate);
  await reportQuest(user, 'supertrade');
  return {
    status: 'success',
  };
};

const createTrade = async ({ user, money, code, steamId, partnerSteamID, myItemsAssetIds, hisItemsAssetIds }) => {
  const partner = await User.findOne({
    steamId: partnerSteamID,
  }).lean();

  if (partner.blacklist.indexOf(user.steamId) > -1) {
    return {
      status: 'error',
      code: 34,
      message: 'Partner blocked this user',
    };
  }

  let myItems = await getUserItemsArray(steamId);
  let hisItems = await getUserItemsArray(partnerSteamID);

  myItems = myItems.filter(item => myItemsAssetIds.indexOf(item.assetid) !== -1);
  hisItems = hisItems.filter(item => hisItemsAssetIds.indexOf(item.assetid) !== -1);

  myItems = myItems.filter(item => item.tradable);
  hisItems = hisItems.filter(item => item.tradable);

  if (myItems.length !== myItemsAssetIds.length) {
    logger.error('[trade][create][createV2] some items are not found (my)');
    return {
      status: 'error',
      code: 32,
      message: 'some items were not found (my)',
    };
  }
  if (hisItems.length !== hisItemsAssetIds.length) {
    return {
      status: 'error',
      code: 33,
      message: 'some items were not found (partner)',
    };
  }

  let myItemsPrice = 0;
  let hisItemsPrice = 0;
  for (let i = 0; i < myItems.length; i++) {
    myItemsPrice += myItems[i].price.steam.safe;
  }
  for (let i = 0; i < hisItems.length; i++) {
    hisItemsPrice += hisItems[i].price.steam.safe;
    // eslint-disable-next-line no-await-in-loop
    await addSkinToUserRecommendation(steamId, hisItems[i].appid, hisItems[i].assetid);
  }

  // if (!myItems.length || !hisItems.length) {
  //   logger.error('[trade][create][createV2] no items found');
  //   return {
  //     status: 'error',
  //     code: 34,
  //     message: 'no items found',
  //   };
  // }

  // eslint-disable-next-line prefer-const

  const newTrade = new Trade({
    money,
    code,
    steamId,
    steamIdPartner: partnerSteamID,
    user1: user._id,
    user2: partner._id,
    myAllSkinsPrice: Math.round(myItemsPrice),
    hisAllSkinsPrice: Math.round(hisItemsPrice),
    difference: Math.round(myItemsPrice) - Math.round(hisItemsPrice),
    items: myItems,
    itemsPartner: hisItems,
    status: 'new',
    close: false,
    datecreate: Date.now(),
    dates: {
      created: new Date(),
    },
  });

  if (money) {
    if (user.money < money) {
      return { status: 'error' };
    }
    const setting = await Settings.findOne({});
    let amountFee = (money * setting.fee) / 100;
    if (amountFee < 1) {
      amountFee = 1;
    }
    // eslint-disable-next-line no-await-in-loop
    await changeMoney(user, 'buy_trade_p2p', 'out', 'wait', newTrade._id, -1 * (money - amountFee));
    // eslint-disable-next-line no-await-in-loop
    await changeMoney(user, 'buy_trade_p2p_fee', 'out', 'wait', newTrade._id, -1 * amountFee);

    await changeMoney(partner, 'sell_trade_p2p', 'in', 'new', newTrade._id, money - amountFee);
    await sumMoneyTransactions(user);
  }

  await newTrade.save();
  await UserNews.create(newTrade.steamId, 'trade', newTrade);
  await changeRating(user.steamId, config.ratingSettings.tradeCreate);
  await reportQuest(user, 'trade');
  return {
    status: 'success',
  };
};

const createBet = async ({ user, money, code, steamId, partnerSteamID, myItemsAssetIds, hisItemsAssetIds, auctionId }) => {
  const partner = await User.findOne({ steamId: partnerSteamID }).lean();

  const myItems = (await getUserItemsArray(steamId)).filter(item => myItemsAssetIds.indexOf(item.assetid) !== -1);
  const hisItems = (await getUserItemsArray(partnerSteamID)).filter(item => hisItemsAssetIds.indexOf(item.assetid) !== -1);

  if (!myItems.length || !hisItems.length) {
    logger.error('[AuctionController][createV2] no items found');
    return { status: 'error', code: 23, message: 'no items found' };
  }

  let myItemsPrice = 0;
  let hisItemsPrice = 0;
  for (let i = 0; i < myItems.length; i++) {
    myItemsPrice += myItems[i].price.steam.safe;
  }
  for (let i = 0; i < hisItems.length; i++) {
    hisItemsPrice += hisItems[i].price.steam.safe;
  }

  const auction = await Auction.findOne({ _id: auctionId }).populate('user bets.user');
  if (!auction) {
    logger.error('[AuctionController][createV2] auction not found');
    return { status: 'error', code: 24, message: 'auction not found' };
  }
  if (!auction.bets) auction.bets = [];

  if (auction.status !== 'open') {
    logger.error('[AuctionController][createV2] error auction status');
    return { status: 'error', code: 25, message: 'error auction status' };
  }

  if (auction.minSkinPrice) {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of myItems) {
      if (item.price.steam.mean < auction.minSkinPrice) {
        return { status: 'error', code: 25, message: 'error min skin price' };
      }
    }
  }
  if (auction.minBetPrice) {
    if (myItemsPrice < auction.minBetPrice) {
      return { status: 'error', code: 25, message: 'error min bet price' };
    }
  }

  for (let i = 0; i < auction.bets.length; i++) {
    const bet = auction.bets[i];
    if (bet.steamId === steamId && bet.tradeObject && bet.tradeObject.items && bet.tradeObject.items.length === myItems.length) {
      if (!bet.tradeObject.items.find(item => myItemsAssetIds.indexOf(item.assetid) === -1)) {
        return { status: 'error', code: 26, message: 'error same bet' };
      }
    }
  }

  for (let i = 0; i < auction.bets.length; i++) {
    const bet = auction.bets[i];
    if (bet.tradeObject && bet.user && bet.tradeObject.myAllSkinsPrice && bet.user.steamId !== user.steamId) {
      if (bet.tradeObject.myAllSkinsPrice < Math.round(myItemsPrice)) {
        const difference = (Math.round(myItemsPrice) - bet.tradeObject.myAllSkinsPrice) / 100;
        // eslint-disable-next-line no-await-in-loop
        await sendPushV3(bet.user, {
          type: 'AUCTION_INFO',
          auctionId: auction._id,
          title: i18n((auction.user.locale || 'en').toLowerCase())
            .bets.betterBetPlaced.title.replace('{{1}}', user.personaname)
            .replace('{{2}}', difference),
          content: i18n((auction.user.locale || 'en').toLowerCase()).bets.betterBetPlaced.content,
        });
      }
    }
  }

  await sendPushV3(auction.user, {
    type: 'AUCTION_INFO',
    auctionId: auction._id,
    title: i18n((auction.user.locale || 'en').toLowerCase()).bets.created.title.replace('{{1}}', user.personaname),
    content: i18n((auction.user.locale || 'en').toLowerCase()).bets.created.content,
  });

  auction.bets.push({
    steamId,
    user,
    tradeObject: {
      _id: new ObjectId(),
      code,
      money,
      steamId,
      steamIdPartner: partnerSteamID,
      user1: user._id,
      user2: partner._id,
      myAllSkinsPrice: Math.round(myItemsPrice),
      hisAllSkinsPrice: Math.round(hisItemsPrice),
      items: myItems,
      itemsPartner: hisItems,
      status: 'new',
      close: false,
      datecreate: Date.now(),
      auctionId,
      dates: {
        created: new Date(),
      },
    },
  });
  await auction.save();
  await reportQuest(user, 'bet');
  return { status: 'success' };
};

module.exports = async (req, res) => {
  const steamId = req.user.steamId;
  const money = req.body.money;
  const partnerSteamID = req.body.partnerSteamID;
  const auctionId = req.body.auctionId;
  const premium = req.body.premium;
  let autoTrade = req.body.autoTrade;
  let myItemsAssetIds = req.body.myItemsAssetIds;
  let hisItemsAssetIds = req.body.hisItemsAssetIds;
  const hisItemsNames = req.body.hisItemsNames;
  const code = generateUnicCode.timecreated(req.user.timecreated);
  if (typeof myItemsAssetIds === 'string') {
    myItemsAssetIds = [myItemsAssetIds];
  }
  if (typeof hisItemsAssetIds === 'string') {
    hisItemsAssetIds = [hisItemsAssetIds];
  }

  if (typeof autoTrade === 'string') {
    autoTrade = autoTrade === 'true';
  }
  if (money > 0) {
    const partner = await User.findOne({ steamId: partnerSteamID });
    if (!req.user.apiKey && !partner.apiKey) {
      res.json({
        status: 'error',
        code: 3,
        message: 'trade ban',
      });
      return;
    }
  }

  const params = {
    user: req.user,
    money,
    code,
    steamId,
    partnerSteamID,
    myItemsAssetIds,
    hisItemsAssetIds,
    hisItemsNames,
    auctionId,
    autoTrade,
    premium,
    paid: false,
    appVersion: req.appVersion,
    osType: req.body.osType,
  };

  let result;
  if (autoTrade) {
    result = await createSuperTrade(params);
  } else if (auctionId) {
    if (steamId === partnerSteamID) {
      logger.error('[trade][create] partner is the same as user');
      res.json({ status: 'error', code: 22, message: 'same user trade' });
      return;
    }
    result = await createBet(params);
  } else {
    if (steamId === partnerSteamID) {
      logger.error('[trade][create] partner is the same as user');
      res.json({ status: 'error', code: 31, message: 'self trade' });
      return;
    }
    result = await createTrade(params);
  }

  res.json(result);
};
