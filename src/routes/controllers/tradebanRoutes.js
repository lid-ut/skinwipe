const config = require('../../../config');

module.exports = class UserRoutes {
  static async getUrls(req, res) {
    res.json({ status: 'success', tradeUrls: config.tradeUrlsForCheckTradeBan });
  }
};
