const Auction = require('../../models/Auction');
const UserNews = require('../../models/UserNews');
const User = require('../../models/User');
const UserSteamItems = require('../../models/UserSteamItems');
const ActionPrice = require('../../models/ActionPrice');

const config = require('../../../config');

const changeCoins = require('../../helpers/changeCoins');
const addPaidStat = require('../../helpers/addPaidStat');
const checkCoins = require('../../helpers/checkCoins');
const changeTraderRating = require('../../helpers/changeTraderRating');
const obsceneFilter = require('../../helpers/obsceneFilter');
const reportQuest = require('../../helpers/reportQuest');
const sendPushV3 = require('../../helpers/sendPushV3');
const i18n = require('../../languages');

const createV2 = async (user, assets, message, premium, paid, disableComments, games, minSkinPrice, minBetPrice) => {
  let items = await UserSteamItems.distinct('steamItems', { steamId: user.steamId }).lean();
  if (!items || !items.length) {
    return { error: { code: 3, message: 'no items' }, auction: null };
  }
  items = items.filter(item => item.tradable && assets.indexOf(item.assetid) > -1);
  items.forEach(item => {
    if (item.float && item.float !== 'unavailable' && item.float !== 'wait...') {
      item.floatInt = Math.floor(parseFloat(item.paintWear) * 1000);
    }
    item.paintWear = item.float;
  });

  if (!items || !items.length) {
    return { error: { code: 4, message: 'no items' }, auction: null };
  }
  if (items.length !== assets.length) {
    return { error: { code: 6, message: 'no items' }, auction: null };
  }

  if (message && message.length) {
    message = obsceneFilter(message);
    if (
      message
        .toLowerCase()
        .replace(/[\s_.,\-~=+\\/]*/g, '')
        .indexOf(user.myInvitationCode) > -1
    ) {
      message = '[censored]';
    }
    if (message.length > 128) {
      message = `${message.substr(0, 128)}...`;
    }
  }
  let auction = await Auction.findOne({
    steamId: user.steamId,
    status: 'open',
    'items.assetid': { $in: items.map(it => it.assetid) },
  });
  if (auction) {
    return { error: { code: 5, message: 'Such auction already exists' } };
  }

  auction = new Auction({
    steamId: user.steamId,
    status: 'open',

    dateCreate: new Date(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,

    items,
    allSkinsPrice: items.reduce((sum, cur) => parseInt(sum || 0, 10) + parseInt(cur.price.steam.safe || 0, 10), 0),

    paid,
    premium: premium || user.subscriber,
    subscriber: user.subscriber,
    disableComments,
    games,
    minSkinPrice,
    minBetPrice,

    bets: [],
  });

  if (message && message.length) {
    auction.message = message;
  }
  await auction.save();
  await UserNews.create(user.steamId, 'auction', auction);
  await changeTraderRating(user, config.ratingSettings.auctionCreate);
  await reportQuest(user, 'auction');
  return { error: null, auction };
};

module.exports = async function process(req, res) {
  const assets = req.body.assets;
  const premium = req.body.premium || false;
  const message = req.body.message || '';
  const disableComments = !!req.body.disableComments;
  const games = req.body.games || ['730', '570'];
  let minSkinPrice = req.body.minSkinPrice || 0;
  let minBetPrice = req.body.minBetPrice || 0;
  const osType = req.body.osType || 'web';

  if (parseInt(minSkinPrice) !== minSkinPrice && minSkinPrice % 1 !== 0) {
    minSkinPrice = minSkinPrice.toFixed(2) * 100;
  }
  if (parseInt(minBetPrice) !== minBetPrice && minBetPrice % 1 !== 0) {
    minBetPrice = minBetPrice.toFixed(2) * 100;
  }

  if (!assets || !assets.length) {
    res.json({
      status: 'error',
      code: 1,
      message: 'no items',
    });
    return;
  }

  let paid = false;

  const { error, auction } = await createV2(req.user, assets, message, premium, paid, disableComments, games, minSkinPrice, minBetPrice);
  if (!auction) {
    res.json({
      status: 'error',
      code: error.code,
      message: error.message,
    });
    return;
  }
  let prices = await ActionPrice.find({ name: { $in: ['create_auction', 'create_auction_premium'] } });
  prices = prices.reduce((result, item) => {
    result[item.name] = item.price;
    return result;
  }, {});
  if (!req.user.subscriber) {
    paid = true;
    // eslint-disable-next-line no-prototype-builtins
    const price = osType === 'android' && prices.hasOwnProperty('create_auction') ? prices.create_auction : 10;
    // eslint-disable-next-line no-prototype-builtins
    const pricePremium = osType === 'android' && prices.hasOwnProperty('create_auction_premium') ? prices.create_auction_premium : 10;
    let coinsNeeded = price;
    if (premium) {
      coinsNeeded += pricePremium;
    }
    if (!(await checkCoins(req.user, coinsNeeded))) {
      res.json({
        status: 'error',
        code: 2,
        message: 'you reached daily premium auctions limit',
      });
      return;
    }
    if (premium) {
      await addPaidStat('premiumAuction', pricePremium);
      await changeCoins(req.user, 'premiumAuction', -pricePremium);
    }
    await addPaidStat('paidAuction', price);
    await changeCoins(req.user, 'paidAuction', -price);

    await auction.updateOne({ _id: auction._id }, { paid });
  }

  const steamId = req.user.steamId;
  const friends = await User.find({ friends: { $in: [steamId] } });
  const array = [];
  for (let i = 0; i < friends.length; i++) {
    const friend = friends[i];
    // eslint-disable-next-line no-await-in-loop
    array.push(
      sendPushV3(friend, {
        type: 'AUCTION_INFO',
        title: i18n((friend.locale || 'en').toLowerCase()).friends.actionCreated.title.replace('{name}', req.user.personaname),
        content: i18n((friend.locale || 'en').toLowerCase()).friends.actionCreated.content,
        auctionId: auction.id,
      }),
    );
  }
  await Promise.all(array);
  res.json({ status: 'success', auction });
};
