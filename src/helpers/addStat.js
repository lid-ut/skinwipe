const TodayStat = require('../models/TodayUsersStat');

module.exports = async function addStat(param, count = 1) {
  const startDate = new Date();
  startDate.setHours(0);
  startDate.setMinutes(0);
  const date = `${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()}`;
  const $inc = {};
  $inc[param] = count;
  await TodayStat.updateOne({ date }, { $inc }, { upsert: true });
};
