const md5 = require('md5');
const config = require('../../../config');
const UserModel = require('../../models/User');
const changeCoins = require('../../helpers/changeCoins');

module.exports = async function process(req, res) {
  const transId = req.query.id;
  const devId = req.query.uid;
  const amt = req.query.amount;
  const currency = req.query.currency;
  const verifier = req.query.verifier;
  const customId = req.query.custom_id;
  const testString = md5(`${transId}${devId}${amt}${currency}${config.adColonySecret}${customId}`);
  if (testString !== verifier) {
    res.send('vc_decline');
    console.log('[adColony] decline no verified');
    return;
  }
  const user = await UserModel.findOne({ steamId: devId });

  if (!user) {
    res.send('vc_decline');
    console.log(`[adColony] decline no user by custom id ${devId}`);
    return;
  }
  await changeCoins(user, 'add-colony-reward', 30);
  res.send('vc_success');
};
