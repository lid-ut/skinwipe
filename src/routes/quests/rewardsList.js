const Quest = require('../../models/Quest');
const config = require('../../../config');

module.exports = async function process() {
  const dailyQuest = await Quest.findOne({ start: { $lt: new Date() }, expiration: { $gt: new Date() } });

  if (!dailyQuest) {
    return { status: 'error', code: 0, message: 'no daily quest found' };
  }

  const result = {
    reward: dailyQuest.reward,
    weekly: {
      entity: 'fireCoin',
      amount: config.quests.weeklyReward,
    },
    monthly: {
      entity: 'fireCoin',
      amount: config.quests.monthlyReward,
    },
  };
  return { status: 'success', result };
};
