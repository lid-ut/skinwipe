const User = require('../../models/User');
const UserController = require('../../controllers/UserController');
const sendPushV3 = require('../../helpers/sendPushV3');
const i18n = require('../../languages');

module.exports = async function setBans(req, res) {
  if (!req.user.bans) {
    req.user.bans = {};
  }

  if (Object.keys(req.body.bans).indexOf('CSGO') > -1) {
    req.user.bans.CSGO = req.body.bans.CSGO;
  }

  if (Object.keys(req.body.bans).indexOf('TRADEBAN') > -1) {
    if (
      (req.user.bans.TRADEBAN ||
        (req.user.bans.TRADEBAN === null && req.user.createdAt.getTime() > new Date(Date.now() - 30 * 24 * 60 * 60))) &&
      !req.body.bans.TRADEBAN
    ) {
      if (!req.user.gotPremiumAfterTradeBan) {
        await UserController.givePremium(req.user, 'firstPremiumAfterTradeBan', 3);

        await sendPushV3(req.user, {
          type: 'INFO',
          title: i18n((req.locale || 'en').toLowerCase()).addPremiumAfterTradeban.title,
          content: i18n((req.locale || 'en').toLowerCase()).addPremiumAfterTradeban.content,
        });
        await User.updateOne({ steamId: req.user.steamId }, { $set: { gotPremiumAfterTradeBan: true } });
      }
    }
    if (req.user.bans.TRADEBAN && !req.body.bans.TRADEBAN) {
      await sendPushV3(req.user, {
        type: 'INFO',
        title: i18n((req.locale || 'en').toLowerCase()).endOfTradeBan.title,
        content: i18n((req.locale || 'en').toLowerCase()).endOfTradeBan.content,
      });
    }
    req.user.bans.TRADEBAN = req.body.bans.TRADEBAN;
  }
  await User.updateOne({ steamId: req.user.steamId }, { $set: { bans: req.user.bans } });
  res.json({ status: 'success' });
};
