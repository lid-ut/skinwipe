const axios = require('axios');
const zlib = require('zlib');
const config = require('../../config');

module.exports = function sendCustomEvent(eventName, userId, doubleParams = null, stringParams = null) {
  let data = {};
  data[userId] = {
    ce: [
      {
        name: eventName,
        entries: [
          {
            t1: parseInt(+new Date() / 1000),
            p: {
              t1: {
                double: doubleParams,
                string: stringParams,
              },
            },
          },
        ],
      },
    ],
  };
  data = JSON.stringify(data);
  zlib.gzip(data, (_, zippedData) => {
    axios
      .post(`https://api.devtodev.com/stat/v1/?api=${config.devtodev.apiKey}`, zippedData, {
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept-Encoding': 'gzip, deflate, br',
        },
      })
      .then(() => {})
      .catch(e => {
        logger.error('[sendDevToDev] Error while sending to devtodev: ', e.response && e.response.data ? e.response.data : '');
      });
  });
};
