const crypto = require('crypto');

// const bannedUsers = ['76561198376560829'];

function getHASH(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

module.exports = async function getUserByXAT(xat) {
  if (!xat || xat.length < 8) {
    return { error: { code: 1, message: 'no XAT provided' }, result: null };
  }
  const hashXat = getHASH(xat);

  const user = await this.model('User').findOne({ xAccessToken: hashXat }).lean();

  if (!user) {
    return { error: { code: 2, message: 'user not found' }, result: null };
  }

  // if (bannedUsers.indexOf(user.steamId) > -1) {
  //   return { error: { code: 3, message: 'banned' }, result: null };
  // }

  // logger.info(`[XAT] [${user.personaname}] [${xat}]`);
  return { error: null, user };
};
