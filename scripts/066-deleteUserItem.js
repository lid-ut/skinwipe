require('../logger');
const deleteUserItems = require('../src/helpers/deleteUserItems');

(async () => {
  await deleteUserItems(['9407433826']);
})();
