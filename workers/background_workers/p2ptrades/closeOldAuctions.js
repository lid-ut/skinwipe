const Auction = require('../../../src/models/Auction.js');

module.exports = async () => {
  const deadTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const processTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
  logger.info(`[closeOldAuctions] deadTime: ${deadTime}`);
  const count = await Auction.updateMany(
    {
      $or: [
        {
          status: { $in: ['open', 'processed'] },
          createdAt: { $lte: deadTime },
        },
        {
          status: 'processed',
          updatedAt: { $lte: processTime },
        },
      ],
    },
    {
      $set: {
        status: 'close',
        autoClose: true,
      },
    },
  );
  logger.info(`[closeOldAuctions] count: ${JSON.stringify(count)}`);
};
