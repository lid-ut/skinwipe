require('../../../logger');
const Quest = require('../../../src/models/Quest');

function randomIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}

const createQuest = async (start, expiration) => {
  const types = ['trade', 'auction', 'bet', 'supertrade', 'friend', 'like', 'comment', 'upProfile'];
  const typeNames = [
    'Создать трейд',
    'Создать аукцион',
    'Создать ставку',
    'Создать супертрейд',
    'Добавить друга',
    'Поставить лайк',
    'Написать комментарий',
    'Подняться в людях',
  ];
  const index = randomIndex(types);
  const q = {
    name: typeNames[index],
    type: types[index],
    start,
    expiration,
    reward: {
      entity: 'fireCoin',
      amount: 50,
    },
  };
  await new Quest(q).save();
};

module.exports = async () => {
  logger.info('[nextQuest] started');
  const nextQuest = await Quest.findOne({ start: { $gt: Date.now() } });
  logger.info(`[nextQuest] nextQuest: ${!!nextQuest}`);
  if (!nextQuest) {
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
    start.setUTCHours(0, 0, 0, 0);
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000);
    expiration.setUTCHours(23, 59, 0, 0);
    await createQuest(start, expiration);
  }
  logger.info('[nextQuest] done.');
};
