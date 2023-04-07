require('../logger');
// const spawn = require('child_process').spawn;

// before(function(done) {
//   this.timeout(30000);
//   logger.info('[TEST] Mocha Starting...');
//   logger.info(`[TEST] ${__dirname}/../index.js`);
//   // server = spawn('node', [__dirname + '/../index.js'], { stdio: 'inherit' });
//   server = spawn('node', [`${__dirname}/../index.js`]);
//   server.stdout.on('data', data => {
//     logger.info('[TEST] ' + data);
//     if (data.indexOf('Server is listening on') > -1) {
//       logger.info('[TEST] Server started.');
//       done();
//     }
//   });
// });

require('./unit/index');
// require('./integration/index');

// after(() => {
//   server.kill();
// });
