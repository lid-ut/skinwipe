const fetch = require('node-fetch');
const config = require('../../../config');

module.exports = async function getTrade(req, res) {
  let tradeRes = {};
  try {
    tradeRes = await fetch(`${config.botsManagerUrl}/trade/${req.params.id}`).then(tradesRes => tradesRes.json());
  } catch (e) {
    console.log(e.toString());
    res.json({ status: 'error', error: e.toString() });
    return;
  }

  res.json({ status: tradeRes.success ? 'success' : 'error', result: tradeRes.result });
};
