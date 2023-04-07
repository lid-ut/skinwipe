const config = require('../../../config');

module.exports = async req => {
  let seconds = {
    lastAuctionRise: Math.floor((Date.now() - new Date(req.user.lastAuctionRise).getTime()) / 1000 - 300),
    lastTradeRise: Math.floor((Date.now() - new Date(req.user.lastTradeRise).getTime()) / 1000 - 300),
    lastProfileRise: Math.floor((Date.now() - new Date(req.user.lastProfileRise).getTime()) / 1000 - 300),
  };
  if (!config.production) {
    seconds = {
      lastAuctionRise: Math.floor((Date.now() - new Date(req.user.lastAuctionRise).getTime()) / 1000 - 60),
      lastTradeRise: Math.floor((Date.now() - new Date(req.user.lastTradeRise).getTime()) / 1000 - 60),
      lastProfileRise: Math.floor((Date.now() - new Date(req.user.lastProfileRise).getTime()) / 1000 - 60),
    };
  }
  return {
    // deprecated:
    superTrade: true,
    auction: true,
    premiumAuction: true,
    auctionUpFree: true,
    traderRatingUpFree: true,

    status: 'success',
    result: {
      auctionRiseCoolDown: seconds.lastAuctionRise > 0 ? 0 : seconds.lastAuctionRise * -1,
      tradeRiseCoolDown: seconds.lastTradeRise > 0 ? 0 : seconds.lastTradeRise * -1,
      profileRiseCoolDown: seconds.lastProfileRise > 0 ? 0 : seconds.lastProfileRise * -1,
    },
  };
};
