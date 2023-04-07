require('../../../logger');
const request = require('request-promise');
const config = require('../../../config');

const proxies = config.proxies;

function pIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}

const fun = async (webApiKey, params) => {
  if (!webApiKey) {
    return [];
  }
  const proxy = proxies[pIndex(proxies)];

  // const timeDivHour = Date.now() - 60 * 60 * 1000;
  const url = `http://api.steampowered.com/IEconService/GetTradeOffers/v1/?key=${webApiKey}&${params}`;
  const r = request.defaults({ proxy });
  const text = await r.get(url).catch(e => {
    console.log(`error: ${proxy} ${url}`);
    if (e.toString().indexOf('Access is denied. Retrying will not help. ') !== -1) {
      throw Error('api key delete');
    }
    return '';
  });

  if (text.indexOf('{') !== 0) {
    return [];
  }
  const result = JSON.parse(text) || [];
  return result.response ? (result.response.trade_offers_received || []).concat(result.response.trade_offers_sent || []) : [];
};

(async () => {
  const res = await fun('A75555A2F3ADD771FA927B1DC7FDF6D8', 'get_sent_offers=1');

  console.log(res);
})();
