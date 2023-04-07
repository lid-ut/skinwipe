const UserSteamItems = require('../../models/UserSteamItems');
const Auction = require('../../models/Auction');
const filterItemsV2 = require('../../helpers/filterItemsV2');
const getVirtualUserItems = require('../../helpers/getVirtualUserItems');
const getVirtualUserItemsCount = require('../../helpers/getVirtualUserItemsCount');
const config = require('../../../config');

const getUsedItems = async user => {
  const auctions = await Auction.find({ steamId: user.steamId, status: 'open' }).lean();
  const assetIds = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const auction of auctions) {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of auction.items) {
      assetIds.push({ assetid: item.assetid });
    }
  }
  return assetIds;
};

module.exports = async function myInventory(req) {
  let limit = parseInt(req.params.limit, 10) || 0;
  let offset = parseInt(req.params.offset, 10) || 0;
  const filters = req.body.filters;

  let items = [];
  if (req.virtual) {
    const virtualItems = await getVirtualUserItems(req.user.steamId, limit, offset);
    const virtualItemsCount = await getVirtualUserItemsCount(req.user.steamId);
    offset -= virtualItemsCount;
    if (offset < 0) {
      offset = 0;
    }
    items = virtualItems;
    limit -= virtualItems.length;
  }

  if (limit > 0) {
    const inventory = await UserSteamItems.find({ steamId: req.user.steamId }).lean();
    let userItems = await filterItemsV2(req.user, inventory, filters, offset, limit);
    userItems = userItems.result || [];

    const auctionAssetIds = await getUsedItems(req.user);

    for (let i = 0; i < userItems.length; i++) {
      const gameName = config.steam.games_names[userItems[i].appid];

      if (!userItems[i].tradeBan || userItems[i].tradeBan < new Date()) {
        userItems[i].tradable = true;
      }

      if (userItems[i].tradable) {
        userItems[i].tradeBan = null;
      }

      if (req.user.bans && req.user.bans[gameName]) {
        userItems[i].tradable = false;
      }
      // eslint-disable-next-line no-loop-func
      if (auctionAssetIds && auctionAssetIds.filter(it => it.assetid === userItems[i].assetid).length > 5) {
        userItems[i].tradable = false;
      }
    }

    items = items.concat(userItems);
  }

  const result = {
    status: 'success',
    result: {
      items,
      itemsCount: req.user.allSkinsCount,
    },
  };
  if (redisClient) {
    redisClient.setex(req.redisToken, 30, JSON.stringify(result));
  }
  return result;
};
