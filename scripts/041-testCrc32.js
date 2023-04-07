// const crc32 = require('crc32');
const generatePromo = require('../src/helpers/generatePromo');

setInterval(() => {
  const time = new Date().getTime();
  // let code = crc32(`${time}`);
  // if (code.length !== 8) {
  //   console.log(`[1][${code.length}] [${code}] [${time}]`);
  // }
  let code2 = generatePromo();
  console.log(`[2][${code2.length}] [${code2}] [${time}]`);
  if (code2.length !== 8) {
    console.log(`[2][${code2.length}] [${code2}] [${time}]`);
  }
}, 10);
