const request = require('request-promise');
const config = require('../../../config');

const proxies = config.proxies;

function pIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}

module.exports = async webApiKey => {
  if (!webApiKey) {
    return {};
  }
  const proxy = proxies[pIndex(proxies)];

  let allTrades = [];

  let lastTradeTime = '';

  while (true) {
    // const timeDivHour = Date.now() - 60 * 60 * 1000;
    let url = `http://api.steampowered.com/IEconService/GetTradeHistory/v1/?key=${webApiKey}&max_trades=5&include_failed=1`;
    console.log(url);
    if (lastTradeTime) {
      url += `&start_after_time=${lastTradeTime}`;
    }

    const r = request.defaults({ proxy });
    // eslint-disable-next-line no-await-in-loop
    const text = await r.get(url).catch(e => {
      console.log(`error: ${proxy} ${e}`);
      if (e.toString().indexOf('Access is denied. Retrying will not help. ') !== -1) {
        throw Error('api key delete');
      }
      return '';
    });

    if (text.indexOf('{') !== 0) {
      return [];
    }
    let result = null;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.log(e.toString());
    }
    const trades = result.response.trades || [];
    if (trades.length < 0) {
      break;
    }

    if (trades.length > 0) {
      lastTradeTime = trades[trades.length - 1].time_init;
    } else {
      break;
    }
    allTrades = allTrades.concat(trades);

    // console.log(lastTradeTime * 1000);
    // console.log(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);

    if (trades.length < 500) {
      break;
    }

    if (lastTradeTime * 1000 <= Date.now() - 24 * 60 * 60 * 1000) {
      break;
    }
  }
  allTrades.sort((a, b) => {
    if (a.time_init > b.time_init) {
      return 1;
    }
    if (a.time_init < b.time_init) {
      return -1;
    }

    return 0;
  });

  return allTrades;
};
