require('../logger');
const Trade = require('../src/models/Trade');

Trade.find({}, { _id: 1, createdAt: 1 }).then(async trades => {
  for (let i = 0; i < trades.length; i++) {
    // console.log(users[i].tradeUrl.replace(/"/g, ''));
    await Trade.updateOne({ _id: trades[i]._id }, { $set: { raisedAt: trades[i].createdAt } });
  }
  logger.info('Done!');
  process.exit(1);
});
