const Settings = require('../../models/Settings');

module.exports = async function getIntersections(req, res) {
  const settings = await Settings.findOne();
  const traders = settings.traders.all;
  const tradersOnline = settings.traders.online;

  const result = {
    status: 'success',
    result: {
      traders,
      online: tradersOnline,
    },
  };
  res.json(result);
};
