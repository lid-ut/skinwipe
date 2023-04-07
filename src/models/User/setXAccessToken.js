const crypto = require('crypto');

function getHASH(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

module.exports = async function setXAccessToken(user, xat) {
  if (!xat) {
    logger.error('no xat');
    return { error: 'no token provided', result: null };
  }
  const xatMd5 = getHASH(`${xat}`);
  if (!user.xAccessToken) {
    user.xAccessToken = [];
  }
  user.xAccessToken.push(xatMd5);
  await this.model('User').updateOne(
    { _id: user._id },
    {
      $set: {
        xAccessToken: user.xAccessToken,
      },
    },
  );
  return { error: null, result: user };
};
