const AdsModel = require('../../models/Ads');
const UserModel = require('../../models/User');
const FireCoin = require('../../models/FireCoin');
const changeCoins = require('../../helpers/changeCoins');
const addStat = require('../../helpers/addStat');
const userController = require('../../controllers/UserController');

module.exports = async function process(req, res) {
  const add = await AdsModel.findById(req.body.id);

  if (!add) {
    res.json({ success: false, error: 'banner not found' });
    return;
  }

  if (!req.user.ads) {
    req.user.ads = [];
  }

  if (req.user.ads.indexOf(req.body.id) !== -1) {
    res.json({ success: false, error: 'already rewarded' });
    return;
  }
  if (!req.user.adsReward) {
    req.user.adsReward = [];
  }
  if (req.user.adsReward.indexOf(req.body.id) !== -1) {
    res.json({ success: false, error: 'already rewarded' });
    return;
  }

  if (add.ssCoinsReward) {
    await new FireCoin({
      steamId: req.user.steamId,
      reason: `add-reward-${add._id}`,
      amount: add.ssCoinsReward,
      used: 0,
      expiration: Date.now() + 30 * 24 * 60 * 60 * 1000,
    }).save();
    await addStat('fireCoinsAdded', add.ssCoinsReward);
  }
  if (add.coinsReward) {
    await changeCoins(req.user, `add-reward-${add._id}`, add.coinsReward);
  }
  if (add.premiumReward) {
    await userController.givePremium(req.user, `add-reward-${add._id}`, add.premiumReward);
  }
  req.user.adsReward.push(req.body.id);
  await UserModel.updateOne({ _id: req.user._id }, { $set: { adsReward: req.user.adsReward } });

  if (add.oneClick) {
    req.user.ads.push(req.body.id);
    await UserModel.updateOne({ _id: req.user._id }, { $set: { ads: req.user.ads } });
  }
  res.json({ success: true });
};
