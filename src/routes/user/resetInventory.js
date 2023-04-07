const resetInventory = require('../../helpers/resetInventory');

module.exports = async function process(req, res) {
  const h3Ago = Date.now() - 3 * 60 * 1000;
  if (new Date(req.user.lastSteamItemsUpdate).getTime() < h3Ago) {
    await resetInventory(req.user.steamId, true);
  }
  res.json({
    status: 'success',
    message: `items count: ${req.user.allSkinsCount || 0}`,
  });
};
