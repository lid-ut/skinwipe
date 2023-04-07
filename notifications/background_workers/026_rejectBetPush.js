const Auction = require('../../src/models/Auction');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();

  const auctions = await Auction.find({
    'bets.tradeObject.status': 'reject',
    'bets.tradeObject.notifications.rejected': null,
    createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
  })
    .populate('bets.user')
    .limit(100)
    .lean()
    .exec();

  for (let i = 0; i < auctions.length; i++) {
    const auction = auctions[i];
    for (let j = 0; j < auction.bets.length; j++) {
      if (!auction.bets[j].user) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (!auction.bets[j].tradeObject) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (auction.bets[j].tradeObject.status !== 'reject') {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (!auction.bets[j].tradeObject.notifications) {
        auction.bets[j].tradeObject.notifications = {};
      }
      if (auction.bets[j].tradeObject.notifications.rejected) {
        // eslint-disable-next-line no-continue
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      await sendPushV3(auction.bets[j].user, {
        type: 'AUCTION_INFO',
        auctionId: auction._id,
        title: i18n((auction.bets[j].user.locale || 'en').toLowerCase()).bets.reject.title,
        content: i18n((auction.bets[j].user.locale || 'en').toLowerCase()).bets.reject.content,
      });

      auction.bets[j].tradeObject.notifications.rejected = true;
    }
    // eslint-disable-next-line no-await-in-loop
    await Auction.updateOne(
      { _id: auction._id },
      {
        $set: { bets: auction.bets },
      },
    );
  }

  logger.info(`[026_rejectBetPush] end in ${Date.now() - startTime}ms`);
  callback();
};
