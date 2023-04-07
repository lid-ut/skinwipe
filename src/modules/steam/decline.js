const request = require('request-promise');
const config = require('../../../config');

const proxies = config.proxies;

function pIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}

module.exports = async (webApiKey, id) => {
  if (!webApiKey || !id) {
    return false;
  }
  const proxy = proxies[pIndex(proxies)];

  // const timeDivHour = Date.now() - 60 * 60 * 1000;
  const url = `http://api.steampowered.com/IEconService/DeclineTradeOffer/v1/?key=${webApiKey}&tradeofferid=${id}`;
  const r = request.defaults({ proxy });
  const text = await r.post(url).catch(e => {
    console.log(`error: ${proxy} ${url}`);
    console.log(e.toString());
    if (e.toString().indexOf('Access is denied. Retrying will not help. ') !== -1) {
      return 'api key delete';
    }
    return '';
  });

  return text !== 'api key delete';
};
