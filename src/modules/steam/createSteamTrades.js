const fetch = require('node-fetch');
const HttpsProxyAgent = require('https-proxy-agent');
const config = require('../../../config');

const proxies = config.proxies;

function pIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}

function toFormData(obj) {
  const out = [];
  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const key in obj) {
    out.push(`${key}=${encodeURIComponent(obj[key])}`);
  }
  return out.join('&');
}

module.exports = async function process(user, trades) {
  if (!user.steamAuth) {
    return { status: 'error', code: 6, message: 'No auth in steam' };
  }
  if (!user.steamAuth.sessionid || !user.steamAuth.steamMachineAuth || !user.steamAuth.steamLoginSecure) {
    return { status: 'error', code: 6, message: 'No auth in steam' };
  }

  const results = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const trade of trades) {
    const url = new URL(trade.tradeUrl);
    const token = url.searchParams.get('token');

    const itemsThem = trade.itemsPartner.map(it => {
      return {
        appid: it.appid,
        contextid: '2',
        amount: 1,
        assetid: it.assetid,
      };
    });

    const itemsMe = trade.items.map(it => {
      return {
        appid: it.appid,
        contextid: '2',
        amount: 1,
        assetid: it.assetid,
      };
    });

    const body = {
      sessionid: user.steamAuth.sessionid,
      serverid: 1,
      partner: trade.seller,
      tradeoffermessage: `SkinSwipe #${trade.code}`,
      json_tradeoffer: JSON.stringify({
        newversion: false,
        version: 2,
        them: {
          assets: itemsThem,
          currency: [],
          ready: true,
        },
        me: {
          assets: itemsMe,
          currency: [],
          ready: true,
        },
      }),
      captcha: '',
      trade_offer_create_params: JSON.stringify({ trade_offer_access_token: token }),
    };

    const proxy = proxies[pIndex(proxies)];
    // eslint-disable-next-line no-await-in-loop
    const res = await fetch('https://steamcommunity.com/tradeoffer/new/send', {
      headers: {
        accept: '*/*',
        'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        cookie:
          `sessionid=${user.steamAuth.sessionid}; ` +
          `steamMachineAuth${user.steamId}=${user.steamAuth.steamMachineAuth}; ` +
          `steamLoginSecure=${user.steamAuth.steamLoginSecure}; `,
        Referer: 'https://steamcommunity.com/tradeoffer/new',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
      body: toFormData(body),
      method: 'POST',
    });

    // eslint-disable-next-line no-await-in-loop
    const json = await res.json();
    results.push(json);
  }

  return { status: 'success', results };
};
