const AdsModel = require('../../models/Ads');

module.exports = async function process(req, res) {
  const add = await AdsModel.findOne({
    active: true,
    banner: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
    locale: req.user.locale,
    _id: { $nin: req.user.ads },
  });

  if (!add) {
    res.json({ success: false, error: 'ads not found' });
    return;
  }

  if (req.user.subscriber) {
    if (!add.showPremium) {
      res.json({ success: false, error: 'ads not found' });
      return;
    }
  }
  res.json({ success: true, add });
};
