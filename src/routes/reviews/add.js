const Reviews = require('../../models/Reviews');
const User = require('../../models/User');

const getScore = async steamId => {
  const revs = await Reviews.find({ steamId, stars: { $ne: null } });
  let avg = 0;
  let count = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const rev of revs) {
    avg += rev.stars;
    if (rev.comment) {
      count++;
    }
  }
  avg = Math.round((avg / revs.length) * 100) / 100 || 0;

  return {
    avg,
    count,
  };
};

module.exports = async (req, res) => {
  let review = await Reviews.findOne({
    comment: { $ne: null },
    'user.steamId': req.user.steamId,
    steamid: req.params.steamId,
  });

  if (!review) {
    review = new Reviews({
      steamId: req.params.steamId,
      user: {
        steamId: req.user.steamId,
        personaname: req.user.personaname,
        avatar: req.user.avatarfull,
      },
    });
  }

  review.stars = req.body.stars;
  if (req.body.comment) {
    review.comment = req.body.comment.trim().length > 0 ? req.body.comment.trim() : null;
  }
  // await review.save();

  // const score = await getScore(req.params.steamId);
  // await User.updateOne({ steamId: req.params.steamId }, { $set: { reviews: score } });

  res.json({ status: 'success' });
};
