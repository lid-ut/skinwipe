const fetch = require('node-fetch');
const config = require('./config');
const p = require('./package');

const discordUrl =
  'https://discordapp.com/api/webhooks/573583846323388465/VIzm_qlcO81vLt5gPCV1y1c4XGBRaZNtnfc3RZBElfQbLMoBf4Ju4s0p5vQZxKxybuvX';

const handler = async e => {
  if (!config.sentry.enabled) {
    console.error(e);
    return;
  }
  const message = e.message ? e.message : JSON.stringify(e);
  const mode = config.production ? 'prod' : 'test';
  await fetch(discordUrl, {
    method: 'POST',
    body: JSON.stringify({
      content: `[SkinSwipe] [${mode}] [${p.version}] ${message}`,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
};

global.process.on('warning', handler);
global.process.on('uncaughtException', handler);
global.process.on('unhandledRejection', handler);

module.exports = handler;
