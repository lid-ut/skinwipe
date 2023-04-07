require('../logger');
require('../src/models/User');
const Auction = require('../src/models/Auction');
const ObjectId = require('mongoose').Types.ObjectId;

const auctionId = ObjectId('5cbdefe930d75f0a50298999');

Auction.findOne(auctionId)
  .populate('user bets.user')
  .lean()
  .exec()
  .then(auction => {
    console.log('bets:', auction.bets.length);
    console.log('created:', auction.createdAt);
    const date = new Date(auction.createdAt).getTime();
    console.log('created:', date);

    for (let i = 0; i < auction.bets.length; i++) {
      if (!auction.bets[i].user.subInfo || !auction.bets[i].user.subInfo.length) {
        console.log(`[${auction.bets[i].user.steamId}] НЕ ГРАЖДАНИН!`);
      } else {
        for (let j = 0; j < auction.bets[i].user.subInfo.length; j++) {
          if (auction.bets[i].user.subInfo[j].purchaseTime) {
            if (auction.bets[i].user.subInfo[j].purchaseTime > date) {
              console.log(`[${auction.bets[i].user.steamId}] [android] НЕ МАНДАРИН!`);
            }
          } else if (auction.bets[i].user.subInfo[j].purchaseDateMs) {
            if (auction.bets[i].user.subInfo[j].purchaseDateMs > date) {
              console.log(`[${auction.bets[i].user.steamId}] [ios] НЕ АПЕЛЬСИН!`);
            }
          } else {
            console.log(`[${auction.bets[i].user.steamId}] НЕ ПАЛЛАДИН!`);
          }
        }
      }
    }

    logger.info('Done!');
    process.exit(1);
  });
