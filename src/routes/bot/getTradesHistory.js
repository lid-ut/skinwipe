const fetch = require('node-fetch');
const config = require('../../../config');

module.exports = async function getTradesHistory(req, res) {
  let tradesStatusRes = {};
  try {
    tradesStatusRes = await fetch(`${config.botsManagerUrl}/trades/history/${req.user.steamId}/${req.body.page}`).then(tradesRes =>
      tradesRes.json(),
    );
  } catch (e) {
    console.log(e.toString());
    res.json({ status: 'error', error: e.toString() });
    return;
  }
  res.json({ status: tradesStatusRes.success ? 'success' : 'error', result: tradesStatusRes.result });
};
