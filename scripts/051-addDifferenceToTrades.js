require('../logger');

const Trade = require('../src/models/Trade');

Trade.find({
  difference: null,
})
  .limit(100000)
  .cursor()
  .eachAsync(
    async trade => {
      const difference = (trade.myAllSkinsPrice || 0) - (trade.hisAllSkinsPrice || 0);
      logger.info(`[${trade._id}] difference: ${difference}`);
      await Trade.updateOne({ _id: trade._id }, { $set: { difference } });
    },
    { parallel: 50 },
  )
  .then(() => {
    console.log('End');
    process.exit(1);
  });
