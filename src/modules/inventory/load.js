const fetch = require('node-fetch');
const config = require('../../../config');

const loadInventory = async (steamId, appId) => {
  const contextId = 2;
  const url = `https://api.steamapis.com/steam/inventory/${steamId}/${appId}/${contextId}?api_key=${config.steamapistoken}`;
  // console.log(url);
  let result = await fetch(url, { timeout: 25000 }).catch(e => {
    return e.toString();
  });
  result = await result.json();

  if (!result.success) {
    return {
      json: {
        error: 'hidden',
        steamId,
        appId,
        assets: [],
        descriptions: [],
      },
      status: 500,
    };
  }
  const json = {
    steamId,
    appId,
    assets: result.assets,
    descriptions: result.descriptions,
  };
  return { json, status: 200 };
};

async function getInventory(steamId, appId, index) {
  const result = await loadInventory(steamId, appId, index);
  return result.json;
}

module.exports = async users => {
  let index = 0;
  const arrPromise = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const user of users) {
    arrPromise.push(getInventory(user.steamId, 730, index));
    index++;
    if (index === 20) {
      index = 0;
    }

    arrPromise.push(getInventory(user.steamId, 570, index));
    index++;
    if (index === 20) {
      index = 0;
    }
  }
  return Promise.all(arrPromise);
};
