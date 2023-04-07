const request = require('request-promise');
const config = require('../../../config');

const proxies = config.proxies;

function pIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}

module.exports = async (webApiKey, id) => {
  if (!webApiKey || !id) {
    return {};
  }
  const proxy = proxies[pIndex(proxies)];

  // const timeDivHour = Date.now() - 60 * 60 * 1000;
  const url = `http://api.steampowered.com/IEconService/GetTradeOffer/v1/?key=${webApiKey}&tradeofferid=${id}`;
  let text = await request.get(url).catch(e => {
    console.log(`error: ${proxy} ${url}`);
    if (e.toString().indexOf('Access is denied. Retrying will not help. ') !== -1) {
      return 'api key delete';
    }
    return '';
  });

  if (text.indexOf('{') !== 0) {
    const r = request.defaults({ proxy });
    text = await r.get(url).catch(e => {
      console.log(`error: ${proxy} ${url}`);
      if (e.toString().indexOf('Access is denied. Retrying will not help. ') !== -1) {
        return 'api key delete';
      }
      return '';
    });

    if (text.indexOf('{') !== 0) {
      return null;
    }
  }
  const result = JSON.parse(text);
  return result.response.offer;
};
