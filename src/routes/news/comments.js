const Comment = require('../../models/Comment');

async function getTheWall(user, limit, offset) {
  const steamIds = [user.steamId].concat(user.friends || []);
  const query = { steamId: steamIds };
  const count = await Comment.countDocuments(query);
  const comments = await Comment.find(query)
    .populate('user')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset || 0)
    .lean()
    .exec();

  return {
    count,
    comments: comments.map(com => {
      if (com.entityType === 'auction') {
        com.entityPreview = {
          auction: com.entityPreview,
        };
      } else if (com.entityType === 'trade') {
        com.entityPreview = {
          trade: com.entityPreview,
        };
      } else {
        com.entityPreview = {
          skin: com.entityPreview,
        };
      }
      return {
        _id: com._id,
        entityType: com.entityType,
        entityId: com.entityId,
        entityPreview: com.entityPreview,
        date: com.createdAt,
        comment: com.comment,
        steamId: com.steamId,
        personaname: com.user.personaname,
        avatar: com.user.avatarfull,
        subscriber: com.user.subscriber,
      };
    }),
  };
}

module.exports = async function process(req, res) {
  const result = await getTheWall(req.user, parseInt(req.params.limit || 20, 10), parseInt(req.params.offset || 0, 10));

  if (redisClient) {
    redisClient.setex(req.redisToken, 20, JSON.stringify({ status: 'success', result }));
  }
  res.send({ status: 'success', result });
};
