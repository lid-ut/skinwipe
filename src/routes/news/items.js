const UserInventoryUpdate = require('../../models/UserInventoryUpdate');
const getNameAndTag = require('../../helpers/getNameAndTag');

async function getTheWall(user, limit, offset) {
  const steamIds = [user.steamId].concat(user.friends || []);
  const query = { steamId: steamIds };
  const count = await UserInventoryUpdate.countDocuments(query);
  const updates = await UserInventoryUpdate.find(query)
    .populate('user')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset || 0)
    .lean()
    .exec();

  return {
    count,
    updates: updates.map(update => {
      return {
        _id: update._id,
        date: update.createdAt,
        comment: update.comment,
        steamId: update.steamId,
        personaname: update.user.personaname,
        avatar: update.user.avatarfull,
        subscriber: update.user.subscriber,
        newItems: update.newItems.map(item => {
          item.amount = parseInt(item.amount || 1, 10);
          if (item.float === null || item.float === undefined || item.float === 'wait...') {
            item.float = 'unavailable';
          }
          item.paintWear = item.float === 'unavailable' ? null : parseFloat(item.float.substr(0, 10));
          item.float = item.float === 'unavailable' ? null : item.float.substr(0, 10);
          item.name = getNameAndTag(item).name;
          item.ExteriorMin = getNameAndTag(item).tag;
          item.tradable = true;
          return item;
        }),
        lostItems: update.lostItems.map(item => {
          item.amount = parseInt(item.amount || 1, 10);
          if (item.float === null || item.float === undefined || item.float === 'wait...') {
            item.float = 'unavailable';
          }
          item.paintWear = item.float === 'unavailable' ? null : parseFloat(item.float.substr(0, 10));
          item.float = item.float === 'unavailable' ? null : item.float.substr(0, 10);
          item.name = getNameAndTag(item).name;
          item.ExteriorMin = getNameAndTag(item).tag;
          item.tradable = true;
          return item;
        }),
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
