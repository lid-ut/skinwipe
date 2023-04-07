const User = require('../../src/models/User');
const Auction = require('../../src/models/Auction');
const sendPushV3 = require('../../src/helpers/sendPushV3');

async function processAuction(auction) {
  const payload = {
    type: 'CHECK_WEB_VIEW',
  };

  const j = auction.bets.findIndex(ab => {
    return ab.tradeObject && ab.tradeObject.status === 'accepted';
  });

  if (j === -1) {
    return;
  }

  if (auction.bets[j].tradeObject.steamTradeStatus === 'send') {
    payload.steamId = auction.bets[j].steamId;
  }
  if (auction.bets[j].tradeObject.steamTradeStatus === 'received') {
    payload.steamId = auction.steamId;
  }

  if (!new Date(auction.bets[j].tradeObject.steamLastSendPushCheck)) {
    logger.info(`[auctionCWVNotification] create date ${auction.bets[j].tradeObject.steamLastSendPushCheck}`);
    auction.bets[j].tradeObject.steamLastSendPushCheck = Date.now();
  }

  const user = await User.findOne({ steamId: auction.bets[j].steamId }).lean();
  const partner = await User.findOne({ steamId: auction.steamId }).lean();
  if (!user || !partner) {
    logger.error(`[auctionCWVNotification] user not found! ${auction.steamId} ${auction.bets[j].steamId}`);
    return;
  }
  await sendPushV3(user, payload, true);
  await sendPushV3(partner, payload, true);
  // logger.info('[tradeCWVNotification] push was sent');

  auction.bets[j].tradeObject.steamSendPushCount = (auction.bets[j].tradeObject.steamSendPushCount || 0) + 1;
  auction.bets[j].tradeObject.steamLastSendPushCheck = Date.now();
  auction.itemChecks = (auction.itemChecks || 0) + 1;
  await Auction.updateOne(
    { _id: auction._id },
    {
      $set: {
        bets: auction.bets,
        itemChecks: auction.itemChecks,
      },
    },
  );
}

module.exports = async callback => {
  const startTime = Date.now();
  logger.info('auctions 027_auctionCWVNotification started');

  const auctions = await Auction.find({
    status: 'processed',
    $or: [
      {
        bets: { $elemMatch: { 'tradeObject.steamLastSendPushCheck': null, 'tradeObject.status': 'accepted' } },
      },
      {
        bets: {
          $elemMatch: {
            'tradeObject.steamLastSendPushCheck': { $lte: new Date(Date.now() - 30 * 60 * 1000) },
            'tradeObject.status': 'accepted',
          },
        },
      },
    ],
  })
    .sort({ itemChecks: 1 })
    .limit(500)
    .lean()
    .exec();

  for (let i = 0; i < auctions.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await processAuction(auctions[i]);
  }

  await Auction.updateMany(
    {
      status: 'processed',
      itemChecks: { $gt: 30 },
    },
    { $set: { itemChecks: 0 } },
  );
  logger.info(`[027_auctionCWVNotification] end in ${Date.now() - startTime}ms`);
  callback();
};
