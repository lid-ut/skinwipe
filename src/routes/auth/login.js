const nanoid = require('nanoid').nanoid;
const fetch = require('node-fetch');
const User = require('../../models/User');
const config = require('../../../config');
const getClearPersonaname = require('../../helpers/getClearPersonaname');
const generatePromo = require('../../helpers/generatePromo');
const resetInventory = require('../../helpers/resetInventory');
const sendPushV3 = require('../../helpers/sendPushV3');
const i18n = require('../../languages');
const Transaction = require('../../models/Transaction');
const countries = require('i18n-iso-countries');
const Purchase = require('../../models/Purchase');
const FireCoin = require('../../models/FireCoin');
const CountryLanguage = require('country-language');
const Jail = require('../../models/Jail');

const bannedIPs = ['109.199.69.178'];

async function setData(params) {
  let user = await User.findOne({ steamId: params.steamId });
  if (!user) {
    user = new User({
      steamId: params.steamId,
      xAccessToken: [],
      myInvitationCode: generatePromo(),
      personaname: params.steamId,
      coinCount: 200,
    });

    const transaction = new Transaction({
      user_steam_id: params.steamId,
      usedEntity: 'coins',
      info: 'first',
      amount: 200,
      token: 'login 200',
    });
    await transaction.save();

    const friends = await User.find({ steamFriends: { $in: [params.steamId] } });
    for (let i = 0; i < friends.length; i++) {
      const friend = friends[i];
      // eslint-disable-next-line no-await-in-loop
      await sendPushV3(friend, {
        type: 'USER_INFO',
        steamId: params.steamId,
        title: i18n((user.locale || 'en').toLowerCase()).friends.newUser.title.replace(
          '{name}',
          params.summaries ? getClearPersonaname(params.summaries) : params.steamId,
        ),
        content: i18n((user.locale || 'en').toLowerCase()).friends.newUser.content,
      });
    }
  }

  if (params.summaries) {
    user.communityvisibilitystate = params.summaries.communityvisibilitystate;
    user.profilestate = params.summaries.profilestate;
    user.personaname = getClearPersonaname(params.summaries);
    user.lastlogoff = params.summaries.lastlogoff;
    user.commentpermission = params.summaries.commentpermission;
    user.profileurl = params.summaries.profileurl;
    user.avatar = params.summaries.avatar;
    user.avatarfull = params.summaries.avatarfull;
    user.personastate = params.summaries.personastate;
    user.realname = params.summaries.realname;
    user.primaryclanid = params.summaries.primaryclanid;
    user.timecreated = params.summaries.timecreated;
    user.personastateflags = params.summaries.personastateflags;
    user.playerBans = params.summaries.playerBans;
    user.haveTradeHistory = params.summaries.haveTradeHistory;
  }

  // console.log(`[login][setData][${user.personaname}]`, user);

  await user.save();
  return user;
}

async function getSteamId(query) {
  if (!query['openid.assoc_handle'] || !query['openid.signed'] || !query['openid.sig']) {
    return null;
  }

  if (!query['openid.claimed_id'] || !query['openid.claimed_id'].length) {
    return null;
  }

  const params = {
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.sig': decodeURIComponent(query['openid.sig']),
    'openid.mode': 'check_authentication',
  };
  query['openid.signed'].split(',').forEach(item => {
    params[`openid.${item}`] = decodeURIComponent(query[`openid.${item}`]);
  });

  const fetchResult = await fetch('https://steamcommunity.com/openid/login', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&'),
    method: 'POST',
    timeout: 20000,
  });
  const body = await fetchResult.text();

  const steamId = query['openid.claimed_id'].replace('https://steamcommunity.com/openid/id/', '');
  if (body.indexOf('is_valid:true') === -1) {
    logger.info(`[getSteamId] body: ${body.replace(/\n/g, '[br]')}`);
    // discord({ message: `[getSteamId][${steamId}][${ipAddress}] fake auth scam detected!` });
    return null;
  }
  return steamId;
}

async function getPlayerSummaries(steamId) {
  if (!steamId) {
    return { error: 'no steamId', result: null };
  }
  let key = config.steam.apikey;
  if (process.env.LOCAL) {
    key = config.steam.localhostApiKey;
  }
  const profileUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamId}`;
  const fetchResults = await fetch(profileUrl).catch(e => {
    logger.error('[getPlayerSummaries] err: %j', e);
    return { error: 'no user data', result: null };
  });
  if (!fetchResults) {
    logger.error(`[getPlayerSummaries] err: steam reject (${steamId})`);
    return { error: 'steam error', result: null };
  }
  const data = await fetchResults.json().catch(e => {
    logger.error('[getPlayerSummaries] err: %j', e);
    return { error: 'no user data', result: null };
  });
  if (!data || !data.response || !data.response.players || !data.response.players[0]) {
    return { error: 'no user data', result: null };
  }

  if (!data.response.players[0].steamId) {
    data.response.players[0].steamId = steamId;
  }
  return { error: null, result: data.response.players[0] };
}

async function getUserData(query) {
  const openidAssocHandle = query['openid.assoc_handle'];
  if (!openidAssocHandle) {
    return null;
  }
  const steamId = await getSteamId(query);
  if (!steamId) {
    return null;
  }

  const summaries = await getPlayerSummaries(steamId);
  if (!summaries || !summaries.result) {
    return null;
  }

  return {
    steamId,
    summaries: summaries.result,
    playerBans: [],
    tradeHistory: [],
  };
}

const getUserInfo = async (user, xat) => {
  if (!user.myInvitationCode) {
    const hash = generatePromo();
    user.myInvitationCode = hash;
    await User.updateOne(
      { _id: user._id },
      {
        $set: { myInvitationCode: hash },
      },
    );
  }

  const hasAndroid = await Purchase.countDocuments({
    steamId: user.steamId,
    success: true,
    'data.productId': { $regex: 'com.mezmeraiz.skinswipe.premium', $options: 'i' },
  });
  const hasIos = await Purchase.countDocuments({
    steamId: user.steamId,
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

  const fireCoins = (
    await FireCoin.find({
      steamId: user.steamId,
      expiration: { $gte: Date.now() },
    })
  ).reduce((sum, cur) => (sum || 0) + cur.amount - cur.used, 0);

  let subExpiration = null;
  for (let i = 0; i < user.subInfo.length; i++) {
    const item = user.subInfo[i];
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

  const countriesWithUserLanguage = CountryLanguage.getLanguageCountries(user.locale);

  let muteHours = 0;
  let muteReason = '';
  if (user.chatBanned) {
    const jail = await Jail.findOne({ steamId: user.steamId });
    if (jail) {
      muteHours = Math.round((jail.expiration.getTime() - Date.now()) / 1000 / 60 / 60);
      muteReason = jail.reason;
    }
  }

  return {
    status: 'success',
    user: {
      subscriber: user.subscriber,
      subExpiration,
      subsHistory: {
        android: true,
        ios: false,
      },
      lastAuctionRise: user.lastAuctionRise || null,
      lastTradeRise: user.lastTradeRise || null,
      lastProfileRise: user.lastProfileRise || null,
      email: user.email,
      mute: user.chatBanned,
      muteHours,
      muteReason,
      statusMessage: user.subscriber && !user.chatBanned ? user.statusMessage || '' : '',
      personaname: user.personaname || '',
      tradeUrl: user.tradeUrl || '',
      apiKey: user.apiKey || '',
      avatar: user.avatar,
      avatarmedium: user.avatarfull,
      avatarfull: user.avatarfull,
      steamId: user.steamId || '',
      coinCount: user.coinCount || 0,
      fireCoins,
      allSkinsCount: user.allSkinsCount || 0,
      allSkinsPrice: user.allSkinsPrice || 0,
      lastSteamItemsUpdate: user.lastSteamItemsUpdate,
      invitationCode: user.invitationCode || '',
      myInvitationCode: user.myInvitationCode || '',
      mySkinInvitationCode: `SK${user.myInvitationCode}`,
      mySkinInvitationPoints: user.mySkinInvitationPoints || 0,
      mySkinInvitationUsers: user.mySkinInvitationUsers || 0,
      createdAt: user.createdAt,
      friends: user.friends || [],
      money: user.money,
      locale: user.locale,
      countryName:
        countriesWithUserLanguage.length > 0
          ? countries.getName(countriesWithUserLanguage[0].code_2, user.locale, { select: 'official' })
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
    constraint: user.constraint,
    topPoints: 0,
    token: xat,
  };
};

module.exports = async function process(req, res) {
  const userData = await getUserData(req.query);

  if (bannedIPs.indexOf(req.ipAddress) > -1) {
    logger.error(`[login][${req.ipAddress}] banned by IP!`);
    return {
      status: 'error',
      code: 666,
      message: 'banned',
    };
  }

  if (!userData || !userData.steamId || !userData.summaries) {
    logger.error(`[login][${req.ipAddress}] no data!`);
    return {
      status: 'error',
      code: 0,
      message: 'something went wrong',
    };
  }

  const user = await setData(userData);
  if (!user) {
    logger.error(`[login][${req.ipAddress}] no user!`);
    return 'internal error';
  }

  await resetInventory(user.steamId);

  const xat = nanoid(64);

  const setTokenResult = await User.setXAccessToken(user, xat);
  if (setTokenResult.error) {
    logger.error(`[login][${req.ipAddress}] setTokenResult error!`);
    return {
      status: 'error',
      code: 1,
      message: 'cannot save token',
    };
  }

  res.cookie('token', xat, {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
    httpOnly: false,
    path: '/',
    // signed: true,
  });

  const data = await getUserInfo(user, xat);

  res.json({
    status: 'success',
    profile: data,
    xAccessToken: xat,
  });
};
