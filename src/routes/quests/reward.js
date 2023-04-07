const Quest = require('../../models/Quest');
const QuestEntry = require('../../models/QuestEntry');
const config = require('../../../config');

const addFireCoins = require('../../helpers/addFireCoins');

module.exports = async function process(req) {
  const dailyQuest = await Quest.findOne({ start: { $lt: new Date() }, expiration: { $gt: new Date() } });

  if (!dailyQuest) {
    return { status: 'error', code: 0, message: 'no daily quest found' };
  }

  const entry = await QuestEntry.findOne({ steamId: req.user.steamId }).populate('quests.quest');
  if (!entry) {
    return { status: 'error', code: 1, message: 'quest entry not found' };
  }

  if (entry.rewardCoolDown && entry.rewardCoolDown.getTime() > Date.now()) {
    return { status: 'error', code: 4, message: 'cooldown' };
  }

  const questIndex = entry.quests.findIndex(q => q.quest._id.toString() === dailyQuest._id.toString());
  if (questIndex === -1) {
    return { status: 'error', code: 2, message: 'quest was not finished' };
  }
  if (entry.quests[questIndex].rewarded) {
    return { status: 'error', code: 3, message: 'rewarded!' };
  }
  entry.quests[questIndex].rewarded = true;

  const result = {
    reward: dailyQuest.reward,
    weekly: false,
    monthly: false,
  };
  // выдать награду за сегодня
  await addFireCoins(req.user.steamId, dailyQuest.reward.amount, Date.now() + 7 * 24 * 60 * 60 * 1000, 'dailyQuest');

  if (entry.quests.length % 7 === 0) {
    // выдать награду за неделю
    await addFireCoins(req.user.steamId, config.quests.weeklyReward, Date.now() + 7 * 24 * 60 * 60 * 1000, 'weeklyQuest');
    result.weekly = true;
  }

  if (entry.quests.length > 27) {
    // выдать награду за месяц
    await addFireCoins(req.user.steamId, config.quests.monthlyReward, Date.now() + 7 * 24 * 60 * 60 * 1000, 'monthlyQuest');
    // очистить историю, если выдана награда за месяц
    entry.quests = [];
    result.monthly = true;
    result.rewardCoolDown = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    entry.rewardCoolDown = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  }

  await QuestEntry.updateOne({ _id: entry._id }, { $set: entry });

  return { status: 'success', result };
};
