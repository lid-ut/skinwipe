const sendPushV3 = require('../../helpers/sendPushV3');

module.exports = async function setStatusMessage(req, res) {
  await sendPushV3(req.user, {
    type: 'INFO',
    title: `code: ${req.body.code}`,
    content: `отправь его боту`,
  });
  res.json({ status: 'success' });
};
