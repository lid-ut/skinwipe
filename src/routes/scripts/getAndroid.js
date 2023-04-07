const { AndroidScriptsController } = require('../../controllers/MobileScriptsController');

module.exports = async function process() {
  return AndroidScriptsController.get();
};
