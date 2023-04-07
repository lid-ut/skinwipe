const AdsModel = require('../../models/Ads');

const getType = locale => {
  if (locale === 'ru' || locale === 'uk' || locale === 'rb' || locale === 'kz') {
    return 'sng';
  }
  return 'ne sng';
};

module.exports = async function process(req, res) {
  const allAds = await AdsModel.find({
    active: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
    locale: getType(req.user.locale),
    _id: { $nin: req.user.ads },
  });

  if (allAds.length === 0) {
    res.json({ status: 'error', error: 'ads not found' });
    return;
  }

  const ads = [];

  for (let i = 0; i < allAds.length; i++) {
    if (!allAds[i].showPremium) {
      if (req.user.subscriber) {
        // eslint-disable-next-line no-continue
        continue;
      }
    }

    if (Date.now() - req.user.createdAt.getTime() < allAds[i].showAfter) {
      // eslint-disable-next-line no-continue
      continue;
    }
    ads.push(allAds[i]);
  }

  res.json({ status: 'success', result: ads });
};
