module.exports = async function run(steamId, type, entity) {
  if (!steamId) {
    return { error: { code: 1, message: 'no user' }, result: null };
  }
  if (!type || !type.length || ['auction', 'trade'].indexOf(type) === -1) {
    return { error: { code: 2, message: 'no eType' }, result: null };
  }
  if (!entity || !entity._id) {
    return { error: { code: 3, message: 'no entity' }, result: null };
  }

  const UserNews = this.model('UserNews');
  const news = new UserNews({
    steamId,
    type,
    createdAt: entity.createdAt,
  });

  if (type === 'auction') {
    news.auction = entity;
  } else if (type === 'trade') {
    news.trade = entity;
  }

  await news.save();

  return { error: null, result: news };
};
