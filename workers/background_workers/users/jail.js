require('../../../logger');
const User = require('../../../src/models/User');
const Jail = require('../../../src/models/Jail');

module.exports = async () => {
  logger.info('[jail] started');
  const prisoners = await Jail.find({ expiration: { $lt: Date.now() } }).lean();

  for (let i = 0; i < prisoners.length; i++) {
    const prisoner = prisoners[i];
    let updateQuery = { steamId: prisoner.steamId };
    if (prisoner.type === 'mute') {
      updateQuery = { $set: { chatBanned: false } };
    }
    // eslint-disable-next-line no-await-in-loop
    await User.updateOne({ steamId: prisoner.steamId }, updateQuery);
    // eslint-disable-next-line no-await-in-loop
    await Jail.deleteOne({ _id: prisoner._id });
  }
};
