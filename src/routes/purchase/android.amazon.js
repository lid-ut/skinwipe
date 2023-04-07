const givePremium = require('../../helpers/givePremium');
const changeCoins = require('../../helpers/changeCoins');
const Transaction = require('../../models/Transaction');

module.exports = async function process(req, res) {
  let jdata;
  try {
    jdata = JSON.parse(req.body.JSONdata);
  } catch (e) {
    logger.error(`[userPurchaseAndroidAmazon] JSONdata parsing filed: ${e}`);
    res.json({
      status: 'error',
      message: 'JSONdata is invalid',
    });
    return;
  }

  if ((await Transaction.find({ token: jdata.receiptId })).length > 0) {
    res.json({ status: 'error' });
    return;
  }

  let coinCount = 50;
  switch (jdata.sku) {
    case 'skinswipe.coins_1_pack':
      coinCount = 1000;
      break;
    case 'skinswipe.coins_2_pack':
      coinCount = 2000;
      break;
    case 'skinswipe.coins_3_pack':
      coinCount = 4000;
      break;
    case 'skinswipe.coins_4_pack':
      coinCount = 3999;
      await givePremium(req.user, 'kassa-premium', 6, jdata.receiptId);
      break;
    default:
      coinCount = 1000;
  }

  await changeCoins(req.user, jdata.receiptId, coinCount);
  res.json({ status: 'success' });
};
