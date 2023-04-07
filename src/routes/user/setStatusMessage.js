const User = require('../../models/User');
const obsceneFilter = require('../../helpers/obsceneFilter');

module.exports = async function setStatusMessage(req, res) {
  const user = req.user;
  let statusMessage = req.body.statusMessage;

  if (!statusMessage) {
    statusMessage = '';
  }

  statusMessage = obsceneFilter(statusMessage);
  if (
    statusMessage
      .toLowerCase()
      .replace(/[\s_.,\-~=+\\/]*/g, '')
      .indexOf(user.myInvitationCode) > -1
  ) {
    statusMessage = '[censored]';
  }
  if (statusMessage.length > 128) {
    statusMessage = `${statusMessage.substr(0, 128)}...`;
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        statusMessage,
      },
    },
  );
  res.json({ status: 'success', statusMessage });
};
