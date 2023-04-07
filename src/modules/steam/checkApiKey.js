const request = require('request-promise');
const config = require('../../../config');

const proxies = config.proxies;

function pIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}

module.exports = async webApiKey => {
  if (!webApiKey) {
    return false;
  }
  const proxy = proxies[pIndex(proxies)];

  // const timeDivHour = Date.now() - 60 * 60 * 1000;
  const url = `http://api.steampowered.com/IEconService/GetTradeOffersSummary/v1/?key=${webApiKey}`;
  const r = request.defaults({ proxy });

  const res = await r.get(url).catch(e => {
    return e.toString();
  });

  let result;

  try {
    result = JSON.parse(res);
  } catch (e) {
    result = null;
  }

  if (result && result.response) {
    return true;
  }
  return res.indexOf('Access is denied. Retrying will not help.') === -1;
};
