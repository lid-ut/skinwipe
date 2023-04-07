const getActionPrices = require('../../controllers/UserController').getActionPrices;

module.exports = async function (req, res) {
  const actionPrices = await getActionPrices(req.user);
  res.json({ status: 'success', result: actionPrices });
};
