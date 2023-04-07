const mongoose = require('mongoose');
const config = require('../../config');

console.log(config.dbConfig.mongo);

mongoose.Promise = global.Promise;

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
if (!config.production) {
  // mongoose.set('debug', true);
}
mongoose.connect(config.dbConfig.mongo, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  readPreference: 'secondaryPreferred',
});

module.exports = mongoose;
