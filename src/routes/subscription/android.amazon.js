const givePremium = require('../../helpers/givePremium');
const changeCoins = require('../../helpers/changeCoins');

module.exports = async function process(req) {
  let jsonData = {};
  try {
    jsonData = JSON.parse(req.body.JSONdata);
  } catch (e) {
    logger.error(`[userSubAndroid] JSONdata parsing filed: ${e}`);
    return { status: 'error', code: 0, message: 'JSONdata is invalid' };
  }

  for (let i = 0; i < req.user.subInfo.length; i++) {
    console.log(`code = ${req.user.subInfo[i].code}`);
    console.log(`receiptId = ${req.body.receiptId}`);
    if (req.user.subInfo[i].code === req.body.receiptId) {
      return { status: 'error' };
    }
  }
  let month = 1;
  switch (jsonData.sku) {
    case 'skinswipe.premium.1m':
      break;
    case 'skinswipe.premium-1m':
      break;
    case 'skinswipe.premium.3m':
      month = 3;
      break;
    case 'skinswipe.premium-3m':
      month = 3;
      break;
    case 'skinswipe.premium.6m':
      await changeCoins(req.user, req.body.receiptId, 1000);
      month = 6;
      break;
    case 'skinswipe.premium-6m':
      await changeCoins(req.user, req.body.receiptId, 1000);
      month = 6;
      break;
    case 'skinswipe.premium.12m':
      month = 12;
      break;
    case 'skinswipe.premium-12m':
      month = 12;
      break;
    default:
      month = 12;
  }
  console.log(`jsonData  = ${jsonData}`);
  console.log(`endDate  = ${month}`);
  await givePremium(req.user, req.body.receiptId, month);
  return { status: 'success' };
};
