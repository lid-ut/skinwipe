const UserModel = require('../../models/User');

module.exports = async function process(req, res) {
  if(!req.user.stories) {
    req.user.stories = [];
  }
  req.user.stories.push(req.body.id);
  await UserModel.updateOne({_id: req.user._id}, {stories: req.user.stories});
  res.json({ status: 'success' });
};
