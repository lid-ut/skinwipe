const ScriptError = require('../../models/ScriptError');

module.exports = async function process(req) {
  await new ScriptError({
    ipAddress: req.ipAddress,
    screen: req.body.screen,
    url: req.body.url,
    script: req.body.script,
    scriptResult: req.body.scriptResult,
    pageContent: '',
  }).save();
  return { status: 'success' };
};
