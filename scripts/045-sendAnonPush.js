require('../logger');
const FirebaseToken = require('../src/models/FirebaseToken');
const sendPushImmediate = require('../src/helpers/sendPushImmediate');

FirebaseToken.find({ steamId: 'anonymous' }).then(async tokens => {
  for (let i = 0; i < tokens.length; i++) {
    await sendPushImmediate(tokens[i], {
      type: 'INFO',
      title: 'Хочешь новенький нож?',
      content: 'Я тоже!',
    });
  }

  logger.info('Done!');
  process.exit(1);
});
