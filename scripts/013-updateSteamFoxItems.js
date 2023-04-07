const fetch = require('node-fetch');
require('../logger');
const UserSteamItems = require('../src/models/UserSteamItems');

UserSteamItems.aggregate([
  { $unwind: '$steamItems' },
  { $match: { 'steamItems.price.steam.safe': 1, 'steamItems.tradable': true } },
  {
    $group: {
      _id: '$steamItems.classid',
      price: { $first: '$steamItems.price.steam.safe' },
      name: { $first: '$steamItems.name' },
      tradable: { $first: '$steamItems.tradable' },
      appid: { $first: '$steamItems.appid' },
      classid: { $first: '$steamItems.classid' },
    },
  },
  { $limit: 300 },
])
  .option({ allowDiskUse: true })
  .then(async assets => {
    logger.info(`Data length: ${assets.length}`);
    const apiUrl = `http://market.skinswipe.gg/api/market`;
    logger.info(`[013] apiUrl: ${apiUrl}`);
    let result = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assets }),
    });
    const res = await result.json();
    logger.info(`[013] status: ${res.status}`);
    logger.info('Done!');
    process.exit(1);
  });
