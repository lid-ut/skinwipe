const axios = require('axios');
const cheerio = require('cheerio');
const SteamStatus = require('../../../src/models/SteamStatus');
const config = require('../../../config');

module.exports = async () => {
  try {
    const result = await axios.get('https://www.csgodatabase.com/csgo-steam-status/');
    const $ = cheerio.load(result.data);
    let inventoriesStatus = '';
    $('.steam-pricing-name').each((index, element) => {
      const parent = $(element).parent('li');
      const label = parent.find('.steam-pricing-name').text();
      if (label.trim() === 'Player Inventories') {
        inventoriesStatus = parent.find('div:not(.steam-pricing-name)').text();
      }
    });
    const steamStatus = new SteamStatus({
      appId: config.steam.games_id.CSGO,
      type: 'inventories',
      status: inventoriesStatus.toLowerCase(),
    });
    await steamStatus.save();
  } catch (e) {
    console.error(e);
  }
};
