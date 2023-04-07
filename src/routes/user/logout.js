const crypto = require('crypto');

const User = require('../../models/User');

function getHASH(str) {
  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex');
}

module.exports = async function process(req, res) {
  let xat = req.headers['x-access-token'];
  if (!xat && req.cookies && req.cookies.token) {
    xat = req.cookies.token;
  }
  const hashXat = getHASH(xat);
  req.user.xAccessToken = req.user.xAccessToken.filter(token => {
    return token !== hashXat;
  });
  await User.updateOne(
    { _id: req.user._id },
    {
      $set: {
        xAccessToken: req.user.xAccessToken,
      },
    },
  );
  res.cookie('token', '', { expires: 1, httpOnly: false });
  return { status: 'success' };
};
