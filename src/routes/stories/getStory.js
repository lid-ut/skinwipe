const StoriesModel = require('../../models/Stories');

module.exports = async function process(req, res) {
  const story = await StoriesModel.findOne({
    _id: req.params.id,
  });

  if (!story) {
    res.json({ status: 'error', error: 'story not found' });
    return;
  }
  story.watched = (req.user.stories || []).indexOf(story._id.toString()) !== -1;
  res.json({ status: 'success', result: story });
};
