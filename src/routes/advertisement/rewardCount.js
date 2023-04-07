const coinsMap = {
  userA: 10,
};

module.exports = async function process(req) {
  let coins = 0;
  if (req.params.cohort && Object.keys(coinsMap).indexOf(req.params.cohort) > -1) {
    coins = coinsMap[req.params.cohort];
  }
  // 17.07.2020 double coins
  const startDate = 1594933200000;
  const endDate = 1595019600000;
  if (Date.now() > startDate && Date.now() < endDate) {
    coins *= 2;
  }
  return { status: 'success', result: { coins } };
};
