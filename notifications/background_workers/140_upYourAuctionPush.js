const Auction = require('../../src/models/Auction');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();
  logger.info('[140_upYourAuction] started');

  const auctions = await Auction.find({
    status: 'open',
    'notifications.upYourAuction': { $ne: true },
    createdAt: {
      $lte: new Date(Date.now() - 60 * 60 * 1000),
    },
  })
    .limit(1250)
    .populate('user')
    .lean()
    .exec();

  for (let i = 0; i < auctions.length; i++) {
    logger.info(`[140_upYourAuction] Working on auction [${i + 1}/${auctions.length}]`);
    const auction = auctions[i];
    if (auction.user && auction.user.steamId) {
      // eslint-disable-next-line no-await-in-loop
      await sendPushV3(auction.user, {
        type: 'AUCTION_INFO',
        auctionId: auction._id,
        title: i18n((auction.user.locale || 'en').toLowerCase()).auction.upYourAuction.title,
        content: i18n((auction.user.locale || 'en').toLowerCase()).auction.upYourAuction.content,
      });
    }

    const notifications = auction.notifications || {};
    notifications.upYourAuction = true;
    // eslint-disable-next-line no-await-in-loop
    await Auction.updateOne(
      { _id: auction._id },
      {
        $set: { notifications },
      },
    );
  }

  logger.info(`[140_upYourAuction] end in ${Date.now() - startTime}ms aucs: ${auctions.length}`);
  callback();
};
