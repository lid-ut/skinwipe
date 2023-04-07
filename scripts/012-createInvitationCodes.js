require('../logger');
const User = require('../src/models/User');
const generatePromo = require('../src/helpers/generatePromo');

User.find({}, { personaname: 1, createdAt: 1, steamId: 1, _id: 1 }).then(async users => {
  logger.info('Data length:', users.length);
  const saveStartTime = Date.now();

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const percent = (i * 100) / users.length;
    logger.info(`[${Math.round(percent)}%] ${user.personaname} in ${Date.now() - saveStartTime} ms`);

    const hash = generatePromo();

    await User.updateOne(
      { _id: user._id },
      {
        $set: { myInvitationCode: hash },
      },
    );
  }

  logger.info('Done!');
  process.exit(1);
});
