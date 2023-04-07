require('../logger');
const getUSDrate = require('../src/helpers/getUSDRate');

(async () => {
  const result = await getUSDrate();
  console.log(result);

  const rubAmount = 10;
  const usdrate = result;
  const usdAmount = Math.floor((rubAmount / usdrate) * 100) / 100;
  console.log(usdAmount);
})();
