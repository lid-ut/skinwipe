const onFinished = require('on-finished');

module.exports = async (req, res) => {
  return new Promise(resolve => {
    onFinished(res, () => {
      logger.info(`[${req.originalUrl}][${(Date.now() - req.startTime) / 1000} sec]`);
      resolve();
    });
  });
};
