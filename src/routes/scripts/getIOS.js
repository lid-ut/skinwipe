const { IOSScriptsController } = require('../../controllers/MobileScriptsController');

module.exports = async function process() {
  return IOSScriptsController.get();
};
