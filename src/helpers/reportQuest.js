const Quest = require('../models/Quest');
const QuestEntry = require('../models/QuestEntry');

module.exports = async function reportQuest(user, type) {
  const dailyQuest = await Quest.findOne({ start: { $lt: new Date() }, expiration: { $gt: new Date() } });
  if (!dailyQuest) {
    return false;
  }
  let entry = await QuestEntry.findOne({ steamId: user.steamId }).populate('quests.quest');
  if (!entry) {
    entry = new QuestEntry({ steamId: user.steamId, quests: [] });
    await entry.save();
  }
  if (entry.rewardCoolDown && entry.rewardCoolDown.getTime() > Date.now()) {
    return false;
  }

  for (let i = 0; i < entry.quests.length; i++) {
    const quest = entry.quests[i].quest;
    const eq = quest._id.toString() === dailyQuest._id.toString();
    if (eq) {
      return false;
    }
  }

  if (dailyQuest.type === type) {
    entry.quests.push({ quest: dailyQuest, rewarded: false });
    await QuestEntry.updateOne({ _id: entry._id }, { $set: entry });
  }
  return true;
};
