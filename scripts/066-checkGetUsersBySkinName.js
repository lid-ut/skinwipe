require('../logger');
const getSteamIdsByItemName = require('../src/helpers/getSteamIdsByItemName');

(async () => {
  const users = await getSteamIdsByItemName('Sticker | B1ad3 | Atlanta 2017');

  console.log(users);
})();
