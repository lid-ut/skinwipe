const AuctionController = require('../../controllers/AuctionController');
const addPaidStat = require('../../helpers/addPaidStat');
const changeCoins = require('../../helpers/changeCoins');
const checkCoins = require('../../helpers/checkCoins');
const reportQuest = require('../../helpers/reportQuest');

module.exports = class AuctionRoutes {
  static async auctionCreateAuction(req, res) {
    const premium = req.body.premium || false;

    let itemsAssetIds = req.body.itemsAssetIds;
    if (typeof itemsAssetIds === 'string' && itemsAssetIds.indexOf('[') === -1) {
      itemsAssetIds = [itemsAssetIds];
    } else if (typeof itemsAssetIds === 'string' && itemsAssetIds.indexOf('[') > -1) {
      itemsAssetIds = JSON.parse(itemsAssetIds);
    }
    if (!itemsAssetIds || !itemsAssetIds.length) {
      res.json({
        status: 'error',
        message: 'no items',
      });
      return;
    }

    let paid = false;
    if (!req.user.subscriber) {
      paid = true;
      let coinsNeeded = 10;
      if (premium) {
        coinsNeeded += 10;
      }
      if (!(await checkCoins(req.user, coinsNeeded))) {
        res.json({
          status: 'error',
          message: 'you reached daily premium auctions limit',
        });
        return;
      }
      if (premium) {
        await addPaidStat('premiumAuction', 10);
        await changeCoins(req.user, 'premiumAuction', -10);
      }
      await addPaidStat('paidAuction', 10);
      await changeCoins(req.user, 'paidAuction', -10);
    }

    const auction = await AuctionController.createV2(req.user, itemsAssetIds, req.body.message, premium, paid);
    if (!auction) {
      res.json({
        status: 'error',
        message: 'auction was not created',
      });
      return;
    }
    await reportQuest(req.user, 'auction');
    res.json({
      status: 'success',
      message: '',
      auction,
    });
  }

  static async auctionGetAuction(req, res) {
    const { result, error } = await AuctionController.getV2(req.user, req.body.auctionId);
    if (redisClient) {
      redisClient.setex(req.redisToken, 30, JSON.stringify({ status: 'success', auction: result, error }));
    }
    res.json({ status: 'success', auction: result, error });
  }
};
