require('../../logger');

const checkApiKey = require('../../src/modules/steam/checkApiKey');

const fun = async () => {
  const res = await checkApiKey('F0431F07818AC568877F54A95CAF00F7');
  console.log(res);
};
fun();
