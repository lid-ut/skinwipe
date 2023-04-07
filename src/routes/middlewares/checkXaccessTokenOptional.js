const User = require('../../models/User');

module.exports = async function checkXAccessToken(req) {
  let xat = req.headers['x-access-token'];
  if (!xat && req.cookies && req.cookies.token) {
    xat = req.cookies.token;
  }
  if (xat) {
    const result = await User.getUserByXAT(xat);
    req.user = result.user;
  }
};
