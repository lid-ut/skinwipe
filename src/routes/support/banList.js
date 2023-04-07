const User = require('../../models/User');

module.exports = async function process(req, res) {
  const users = await User.find(
    {
      // $or: [{ abuser: true }, { chatBanned: true }, { banned: true }],
      $or: [{ chatBanned: true }, { banned: true }],
    },
    {
      steamId: 1,
      personaname: 1,
      abuser: 1,
      chatBanned: 1,
      banned: 1,
      avatarfull: 1,
    },
  );

  res.json({ users });
};
