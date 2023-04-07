const fetch = require('node-fetch');
const Settings = require('../models/Settings');

module.exports = async () => {
  const res = await fetch(`https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail/chart?id=1027&range=ALL`);

  const json = await res.json();
  const settings = await Settings.findOne();

  try {
    settings.etherToUSD = parseInt(json.data.points[Object.keys(json.data.points)[Object.keys(json.data.points).length - 1]].v[0], 10);
  } catch (e) {
    console.error(`[etherToUSD.js] error: ${e.toString()}`);
  }

  return settings.etherToUSD;
};
