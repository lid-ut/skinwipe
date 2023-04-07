// const Trade = require('../../models/Trade');

module.exports = async function process(req, res) {
  // await Trade.updateOne({ _id: req.params.tradeId }, { $inc: { views: 1 } });
  res.json({ status: 'success', result: {} });
};
