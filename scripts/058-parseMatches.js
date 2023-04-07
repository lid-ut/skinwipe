const http = require('http');
const axios = require('axios');
const { parse } = require('node-html-parser');
require('../logger');

// axios.get('https://www.hltv.org/results?offset=0')
//   .then((result) => {
//     let page = parse(result.data)
//     let items = page.querySelectorAll('.result-con')
//     for (let i = 0; i < items.length; i++) {
//       let item = items[i];
//       let matchUrl = item.querySelector('a').getAttribute('href');
//       console.log(matchUrl);
//       let matchId = matchUrl.match(new RegExp('^\/matches\/([0-9]+)\/'))[1]
//       console.log(matchId);
//     }
//   })
