const Reviews = require('../../models/Reviews');

module.exports = async (req, res) => {
  let sort = null;
  // eslint-disable-next-line default-case
  switch (req.body.sort) {
    case 'asc':
      sort = {
        stars: 1,
      };
      break;
    case 'desc':
      sort = {
        stars: -1,
      };
      break;
    case 'new':
      sort = {
        createdAt: -1,
      };
      break;
    case 'old':
      sort = {
        createdAt: 1,
      };
      break;
  }
  const offset = ((parseInt(req.params.page, 10) || 1) - 1) * 30;
  const reviews = await Reviews.find({
    steamId: req.params.steamId,
    comment: { $ne: null },
  })
    .sort(sort)
    .skip(offset)
    .limit(30);
  res.json({ status: 'success', result: reviews.filter(it => (it.comment ? it.comment.length > 0 : false)) });
};
