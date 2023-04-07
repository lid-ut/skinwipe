const TodayStat = require('../models/TodayUsersStat');

module.exports = async function addPaidStat(param, amount) {
  const startDate = new Date();
  startDate.setHours(0);
  startDate.setMinutes(0);
  const date = `${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()}`;
  const $inc = {};
  $inc[`paid.${param}`] = 1;
  if (amount) {
    $inc[`paidAmounts.${param}`] = amount;
  }
  await TodayStat.updateOne({ date }, { $inc }, { upsert: true });
};
