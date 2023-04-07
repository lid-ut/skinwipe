const config = require('../../../config');

module.exports = async function list(req, res) {
  res.json({ status: 'success', result: config.tradeUrlsForCheckTradeBan });
};
