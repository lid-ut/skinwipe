const Auction = require('../../src/models/Auction');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

// 2.3. аукцион более 7 дней не принял
module.exports = async callback => {
  const startTime = Date.now();
  logger.info('auctions 024_closedAuction started');

  const auctions = await Auction.find({
    autoClose: true,
    status: 'close',
    'notifications.closed': { $ne: true },
    createdAt: { $gte: new Date(1588324958000) },
  })
    .limit(50)
    .populate('user')
    .lean()
    .exec();

  for (let i = 0; i < auctions.length; i++) {
    const auction = auctions[i];
    if (!auction.user) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    await sendPushV3(auction.user, {
      type: 'AUCTION_INFO',
      auctionId: auction._id,
      title: i18n((auction.user.locale || 'en').toLowerCase()).auction.closed.title,
      content: i18n((auction.user.locale || 'en').toLowerCase()).auction.closed.content,
    });

    const notifications = auction.notifications || {};
    notifications.closed = true;
    // eslint-disable-next-line no-await-in-loop
    await Auction.updateOne(
      { _id: auction._id },
      {
        $set: { notifications },
      },
    );
  }

  logger.info(`[024_closedAuction] end in ${Date.now() - startTime}ms`);
  callback();
};
