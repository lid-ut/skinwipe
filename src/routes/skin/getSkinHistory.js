const fetch = require('node-fetch');
const SteamPricesHistory = require('../../models/SteamPricesHistory');

module.exports = async function process(req) {
  const name = decodeURIComponent(req.params.name);
  const appId = req.params.appId;

  const startDay = new Date().setMinutes(0, 0, 0);
  let steamPricesHistory = await SteamPricesHistory.findOne({
    name,
    update: { $gte: new Date(startDay) },
  });

  if (!steamPricesHistory) {
    try {
      const res = await (await fetch(`http://localhost:3235/history/?name=${encodeURI(name)}&appId=${appId}`)).json();
      steamPricesHistory = {
        update: new Date(),
        history: {
          week: res.week,
          month: res.month,
          year: res.year,
        },
      };
      await SteamPricesHistory.updateMany({ name, appId }, steamPricesHistory, { upsert: true });
    } catch (e) {
      console.log('[getSkinHistory] error', e.toString());
    }
  }
  return {
    status: 'success',
    result: {
      appId,
      name,
      history: steamPricesHistory.history,
    },
  };
};
