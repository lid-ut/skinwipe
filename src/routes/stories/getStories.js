const StoriesModel = require('../../models/Stories');

module.exports = async function process(req, res) {
  const stories = await StoriesModel.find({
    active: true,
    locale: req.user.locale,
  });

  if (stories.length === 0) {
    res.json({ status: 'error', error: 'stories not found' });
    return;
  }

  for (let i = 0; i < stories.length; i++) {
    stories[i].watched = (req.user.stories || []).indexOf(stories[i]._id.toString()) !== -1;
  }

  res.json({ status: 'success', result: stories });
};
