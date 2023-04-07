const obsceneFilter = require('./obsceneFilter');

module.exports = function getClearPersonaname(user) {
  if (!user || !user.personaname || !user.steamId) {
    logger.error(`[getClearPersonaname][suspect] ${user.personaname} ${user.steamId}`);
    return '[suspicious]';
  }

  user.personaname = obsceneFilter(user.personaname);
  if (user.personaname === '[censored]') {
    user.personaname = user.steamId;
  }

  return user.personaname.trim();
};
