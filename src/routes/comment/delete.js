const Comment = require('../../models/Comment');

module.exports = async function process(req, res) {
  const comment = await Comment.findOne({ _id: req.params.cid });
  if (!comment) {
    res.json({ status: 'error', code: 1, message: 'Comment not found' });
    return;
  }
  if (comment.steamId !== req.user.steamId) {
    if (comment.entityPreview && comment.entityPreview.steamId && comment.entityPreview.steamId !== req.user.steamId) {
      res.json({ status: 'error', code: 2, message: 'Access denied' });
      return;
    }
    if (comment.entityPreview && comment.entityPreview.userSteamId && comment.entityPreview.userSteamId !== req.user.steamId) {
      res.json({
        status: 'error',
        code: 2,
        message: 'Access denied',
      });
      return;
    }
  }
  await comment.deleteOne({ _id: req.params.cid });
  res.json({ status: 'success' });
};
