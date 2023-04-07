const SteamStatus = require('../../models/SteamStatus');

module.exports = async function process(req) {
  const status = await SteamStatus.findOne({ type: 'inventories' }).sort({ createdAt: -1 });
  if (!status) {
    return {
      status: 'error',
      message: 'No data so far',
    };
  }
  return {
    status: 'success',
    result: {
      status: status.status,
    },
  };
};
