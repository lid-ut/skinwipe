const User = require('../../models/User');

module.exports = async function checkXAccessToken(req, res) {
  if (req.appVersion === 'N/A') {
    res.status(403).send('NIE GRAZJDANIN!').end();
    return;
  }

  let xat = req.headers['x-access-token'];
  if (!xat && req.cookies && req.cookies.token) {
    xat = req.cookies.token;
  }
  if (!xat || xat.length < 8) {
    res.status(403).send('NIE GRAZJDANIN!').end();
    return;
  }

  const { user, error } = await User.getUserByXAT(xat);
  if (!user || typeof user !== 'object' || !user.steamId) {
    // logger.error('[checkXAccessToken] getUserByXAT %j', error);
    res.status(403).send('user not found').end();
    return;
  }

  const tn = new Date();
  tn.setHours(0);
  tn.setMinutes(0);
  const date = `${tn.getDate()}-${tn.getMonth() + 1}-${tn.getFullYear()}`;

  const updateObject = {
    lastActiveDate: Date.now(),
    updatedAt: Date.now(),
  };

  req.user = user;
  if (req.user.banned || req.user.bannedPermanent) {
    res.status(406).json({
      code: req.user.bannedCode || 0,
      reason: req.user.bannedReason,
      hours: Math.round(((req.user.bannedTime || Date.now()) - Date.now()) / 1000 / 60 / 60),
      milliseconds: Math.round((req.user.bannedTime || Date.now()) - Date.now()),
    });
    return;
  }

  if (req.user.marketBan) {
    if (req.user.marketBanTime < Date.now()) {
      updateObject.marketBan = false;
      updateObject.marketBanTime = null;
      updateObject.closeMarketTrades = 0;
    }
  }

  if (!req.user.webActiveDates) {
    req.user.webActiveDates = [];
  }

  if (!req.user.mobileActiveDates) {
    req.user.mobileActiveDates = [];
  }

  if (req.headers.engine && req.headers.engine === 'WebSkinSwipe' && req.user.webActiveDates.indexOf(date) === -1) {
    req.user.webActiveDates.push(date);
    if (req.user.webActiveDates.length > 35) {
      req.user.webActiveDates = req.user.webActiveDates.slice(-35);
    }
    updateObject.webActiveDates = req.user.webActiveDates;
  } else if (req.user.mobileActiveDates.indexOf(date) === -1) {
    req.user.mobileActiveDates.push(date);
    if (req.user.mobileActiveDates.length > 35) {
      req.user.mobileActiveDates = req.user.mobileActiveDates.slice(-35);
    }
    updateObject.mobileActiveDates = req.user.mobileActiveDates;
  }
  updateObject.ipAddress = req.ipAddress;
  await User.updateOne(
    { steamId: req.user.steamId },
    {
      $set: updateObject,
    },
  );
};
