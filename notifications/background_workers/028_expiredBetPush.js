const Auction = require('../../src/models/Auction');
const sendPushV3 = require('../../src/helpers/sendPushV3');
const i18n = require('../../src/languages');

module.exports = async callback => {
  const startTime = Date.now();

  const auctions = await Auction.find({
    status: 'close',
    'bets.tradeObject.notifications.expired': null,
  })
    .populate('user bets.user')
    .limit(100)
    .lean()
    .exec();

  for (let i = 0; i < auctions.length; i++) {
    const auction = auctions[i];
    logger.info(`[expiredBetPush][${i + 1}/${auctions.length}] ${auction._id} in ${Date.now() - startTime} ms`);
    for (let j = 0; j < auction.bets.length; j++) {
      logger.info(`[expiredBetPush][${j + 1}/${auction.bets.length}]`);
      if (!auction.bets[j].tradeObject) {
        auction.bets[j].tradeObject = {};
      }
      if (!auction.bets[j].tradeObject.notifications) {
        auction.bets[j].tradeObject.notifications = {};
      }
      auction.bets[j].tradeObject.notifications.created = true;
      if (auction.bets[j].tradeObject.notifications.expired) {
        // eslint-disable-next-line no-continue
        continue;
      }
      auction.bets[j].tradeObject.notifications.expired = true;
      if (!auction.bets[j].tradeObject.status) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (!auction.bets[j].user) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (auction.bets[j].tradeObject.status !== 'new') {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (!auction.user) {
        // eslint-disable-next-line no-continue
        continue;
      }
      // eslint-disable-next-line no-await-in-loop
      await sendPushV3(auction.bets[j].user, {
        type: 'AUCTION_INFO',
        auctionId: auction._id,
        title: i18n((auction.bets[j].user.locale || 'en').toLowerCase()).bets.betHavenotAccepted.title.replace(
          '{{1}}',
          auction.user.personaname,
        ),
        content: i18n((auction.bets[j].user.locale || 'en').toLowerCase()).bets.betHavenotAccepted.content,
      });
    }
    // eslint-disable-next-line no-await-in-loop
    await Auction.updateOne(
      { _id: auction._id },
      {
        $set: { bets: auction.bets },
      },
    );
  }

  logger.info(`[expiredBetPush] end in ${Date.now() - startTime}ms`);
  callback();
};
