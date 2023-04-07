const CountryLanguage = require('country-language');
const countries = require('i18n-iso-countries');
const generatePromo = require('../../helpers/generatePromo');
const User = require('../../models/User');
const Purchase = require('../../models/Purchase');
const Jail = require('../../models/Jail');
const FireCoin = require('../../models/FireCoin');

module.exports = async function process(req, res) {
  if (!req.user.myInvitationCode) {
    const hash = generatePromo();
    req.user.myInvitationCode = hash;
    await User.updateOne(
      { _id: req.user._id },
      {
        $set: { myInvitationCode: hash },
      },
    );
  }

  const hasAndroid = await Purchase.countDocuments({
    steamId: req.user.steamId,
    success: true,
    'data.productId': { $regex: 'com.mezmeraiz.skinswipe.premium', $options: 'i' },
  });
  const hasIos = await Purchase.countDocuments({
    steamId: req.user.steamId,
    success: true,
    'data.productId': {
      $in: [
        'premium_30_trial_7_price_899_date_20181017',
        'premium_60_trial_0_price_299',
        'premium_180_trial_0_price_399',
        'premium_360_trial_0_price_649',
      ],
    },
  });

  let xat = req.headers['x-access-token'];
  if (!xat && req.cookies && req.cookies.token) {
    xat = req.cookies.token;
  }

  const fireCoins = (
    await FireCoin.find({
      steamId: req.user.steamId,
      expiration: { $gte: Date.now() },
    })
  ).reduce((sum, cur) => (sum || 0) + cur.amount - cur.used, 0);

  let subExpiration = null;
  for (let i = 0; i < req.user.subInfo.length; i++) {
    const item = req.user.subInfo[i];
    let expiration = item.expiration || item.expirationTime || item.expiresDateMs;
    if (expiration instanceof Date) {
      expiration = +new Date(expiration);
    } else {
      expiration = parseInt(expiration, 10);
    }
    if (expiration > new Date(subExpiration).getTime()) {
      subExpiration = new Date(expiration).toISOString();
    }
  }

  const countriesWithUserLanguage = CountryLanguage.getLanguageCountries(req.user.locale);

  let muteHours = 0;
  let muteReason = '';
  if (req.user.chatBanned) {
    const jail = await Jail.findOne({ steamId: req.user.steamId });
    if (jail) {
      muteHours = Math.round((jail.expiration.getTime() - Date.now()) / 1000 / 60 / 60);
      muteReason = jail.reason;
    }
  }

  res.json({
    status: 'success',
    user: {
      subscriber: req.user.subscriber,
      subExpiration,
      subsHistory: {
        android: true,
        ios: false,
      },
      lastAuctionRise: req.user.lastAuctionRise || null,
      lastTradeRise: req.user.lastTradeRise || null,
      lastProfileRise: req.user.lastProfileRise || null,
      email: req.user.email,
      mute: req.user.chatBanned,
      muteHours,
      muteReason,
      statusMessage: req.user.subscriber && !req.user.chatBanned ? req.user.statusMessage || '' : '',
      personaname: req.user.personaname || '',
      tradeUrl: req.user.tradeUrl || '',
      apiKey: req.user.apiKey || '',
      avatar: req.user.avatar,
      avatarmedium: req.user.avatarfull,
      avatarfull: req.user.avatarfull,
      steamId: req.user.steamId || '',
      coinCount: req.user.coinCount || 0,
      fireCoins,
      allSkinsCount: req.user.allSkinsCount || 0,
      allSkinsPrice: req.user.allSkinsPrice || 0,
      lastSteamItemsUpdate: req.user.lastSteamItemsUpdate,
      invitationCode: req.user.invitationCode || '',
      myInvitationCode: req.user.myInvitationCode || '',
      mySkinInvitationCode: `SK${req.user.myInvitationCode}`,
      mySkinInvitationPoints: req.user.mySkinInvitationPoints || 0,
      mySkinInvitationUsers: req.user.mySkinInvitationUsers || 0,
      createdAt: req.user.createdAt,
      friends: req.user.friends || [],
      money: Math.floor(req.user.money),
      locale: req.user.locale,
      countryName:
        countriesWithUserLanguage.length > 0
          ? countries.getName(countriesWithUserLanguage[0].code_2, req.user.locale, { select: 'official' })
          : '',
    },
    place: 0,
    tradesInfo: {
      gotTrades: 0,
      createdTrades: 0,
      finishedTrades: 0,
      acceptedTrades: 0,
      createdAutoTrades: 0,
      finishedAutoTrades: 0,
      createdAuctions: 0,
      finishedAuctions: 0,
      successfulAuctions: 0,
      newTrades: 0,
    },
    constraint: req.user.constraint,
    topPoints: 0,
    token: xat,
  });
};
