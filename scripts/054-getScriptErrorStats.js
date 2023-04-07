const fs = require('fs');
require('../logger');
const ScriptError = require('../src/models/ScriptError');
(async () => {
  let errors = await ScriptError.find({ script: 'trade' }, { url: 1 });
  fs.writeFileSync('na.txt', errors);
  console.log('done');
})();
