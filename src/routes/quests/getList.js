const AppStrings = require('../../models/AppStrings');
const Quest = require('../../models/Quest');
const QuestEntry = require('../../models/QuestEntry');

module.exports = async function process(req) {
  const quests = await Quest.find({}).sort({ start: -1 }).limit(29);
  const dailyQuest = await Quest.findOne({ start: { $lt: new Date() }, expiration: { $gt: new Date() } });
  const nextQuest = await Quest.findOne({ start: { $gt: Date.now() } });

  let entry = await QuestEntry.findOne({ steamId: req.user.steamId }).populate('quests.quest');
  if (!entry) {
    entry = new QuestEntry({ steamId: req.user.steamId, quests: [] });
    await entry.save();
  }

  let rewardCoolDown = null;
  if (entry.rewardCoolDown && entry.rewardCoolDown.getTime() > Date.now()) {
    rewardCoolDown = entry.rewardCoolDown;
  }

  // выдаём инфу о dailyQuest (complete)
  const dailyEntry = entry.quests.find(q => q.quest._id.toString() === dailyQuest._id.toString());
  dailyQuest.complete = !!dailyEntry;
  dailyQuest.rewarded = dailyEntry && dailyEntry.rewarded;

  const preStreak = entry.quests.filter(it => it.rewarded).length;
  quests.reverse();
  // удаляем предыдущие если есть пропуск
  for (let i = 0; i < quests.length - 2; i++) {
    const currentEntryIndex = entry.quests.findIndex(q => q.quest._id.toString() === quests[i]._id.toString());
    if (currentEntryIndex === -1) {
      entry.quests = entry.quests.filter(q => q.quest.start.getTime() > quests[i].start.getTime());
    }
  }

  // console.log('quests:', quests);
  // console.log('entry:', JSON.stringify(entry));

  await QuestEntry.updateOne({ _id: entry._id }, { $set: entry });

  const streak = entry.quests.filter(it => it.rewarded).length;

  // убрать из history текущий квест
  const history = entry.quests
    .filter(q => q.rewarded && q.quest._id.toString() !== dailyQuest._id.toString())
    .map(q => {
      return {
        name: q.quest.name,
        type: q.quest.type,
        reward: q.quest.reward,
      };
    });

  const week = Math.floor((streak || 1) / 7) + 1;
  const currentWeekHistory = history.filter((h, i) => i + 1 > (week - 1) * 7);

  const find = {
    screenId: 'QUEST_RULES',
  };

  if (req.user.locale === 'ru') {
    find.locale = req.user.locale;
  } else {
    find.locale = 'en';
  }

  const stringsObj = await AppStrings.findOne(find).lean();

  return {
    status: 'success',
    result: {
      images: {
        beginImageUrl: 'http://skinswipe.gg/img/quests/beginImageUrl.png',
        failedImageUrl: 'http://skinswipe.gg/img/quests/failedImageUrl.png',
        monthlyImageUrl: 'http://skinswipe.gg/img/quests/monthlyImageUrl.png',
        weeklyImageUrl: 'http://skinswipe.gg/img/quests/weeklyImageUrl.png',
      },
      rules: stringsObj ? stringsObj.data : [],
      maintenance: false, // true = "квесты недоступны"
      streak,
      day: (streak % 7) + 1,
      week,
      history,
      currentWeekHistory,
      rewardCoolDown,
      failedQuests: preStreak - streak,
      dailyQuest: {
        type: dailyQuest.type,
        start: dailyQuest.start,
        expiration: dailyQuest.expiration,
        reward: dailyQuest.reward,
        complete: dailyQuest.complete,
        rewarded: dailyQuest.rewarded,
      },
      nextQuest: {
        type: nextQuest.type,
        start: nextQuest.start,
        expiration: nextQuest.expiration,
        reward: nextQuest.reward,
      },
      weeklyQuest: {
        reward: {
          entity: 'fireCoin',
          amount: 250,
        },
      },
      monthlyQuest: {
        reward: {
          entity: 'fireCoin',
          amount: 1000,
        },
      },
    },
  };
};
