const config = require('../../../config');
const getBotsItems = require('../../helpers/getBotsItems');

module.exports = async function createTrade(req, res) {
  const botItems = req.body.botItems;
  let fee = config.fee;
  if (req.user.subscriber) {
    fee = 1.18;
  }

  const dbBotsItems = await getBotsItems(req.user, botItems, fee);

  res.json({ status: 'success', result: dbBotsItems.filter(it => !!it.buyer) });
};
