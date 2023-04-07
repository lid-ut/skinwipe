const TradesController = require('../../controllers/TradesController');

const UserController = require('../../controllers/UserController');
const AuctionController = require('../../controllers/AuctionController');
const User = require('../../models/User');
const sendPushV3 = require('../../helpers/sendPushV3');
const SteamItemController = require('../../controllers/SteamItemController');
const getNameAndTag = require('../../helpers/getNameAndTag');
const setEmail = require('../user/setEmail');
const getUserItems = require('../../helpers/getUserItems');
const resetInventory = require('../../helpers/resetInventory');
const config = require('../../../config');

module.exports = class UserRoutes {
  static async updateUser(req, res) {
    await setEmail(req);
    const result = {
      status: 'success',
      code: 0,
    };
    req.body.invitationCode = req.body.invitationCode.toLowerCase();
    if (req.body.invitationCode && req.body.invitationCode.length) {
      const setCodeResult = await UserController.setInvitationCode(req.user, req.body.invitationCode.toLowerCase());
      if (setCodeResult.error) {
        res.json({
          status: 'error',
          code: 2,
          scMssage: setCodeResult.error.message || 'error',
          scCode: setCodeResult.error.code || 0,
        });
        return;
      }
      if (setCodeResult.coins) {
        req.user.coinCount += setCodeResult.coins;
        result.coins = setCodeResult.coins;
      }
      if (setCodeResult.codeType) {
        result.codeType = setCodeResult.codeType;
      }
    }
    result.coinCount = req.user.coinCount;
    res.json(result);
  }

  static async userSendTradePushToUser(req, res) {
    // todo: check trade messages
    const trade = await TradesController.getLastTrade(req.body.partnerSteamId, req.user.steamId);
    if (!trade) {
      res.json({
        status: 'error',
        message: 'trade not found',
      });
      return;
    }
    const partner = await User.findOne({ steamId: req.body.partnerSteamId }).lean();
    await sendPushV3(partner, {
      type: 'STEAM_TRADE_INFO',
      personaname: req.user.personaname,
      steamTradeInfo: `Steam: ${req.body.message}`,
      tradeId: trade._id,
    });
    res.json({ status: 'success' });
  }

  static async updateItems(req, res) {
    const timeAgo = Date.now() - 3 * 60 * 1000;
    if (new Date(req.user.lastSteamItemsUpdate).getTime() < timeAgo) {
      await resetInventory(req.user.steamId, true);
    }
    res.json({
      status: 'success',
      message: `items count: ${req.user.allSkinsCount}`,
    });
  }

  static async userWishlistGetItemsWithOffset(req, res) {
    let filters = req.body.filters;
    const priceCats = req.body.priceCats;
    const sortByPrice = req.body.sortByPrice;
    const sortByUsers = req.body.sortByUsers;

    if (typeof filters === 'string') {
      try {
        filters = JSON.parse(req.body.filters);
      } catch (e) {
        logger.error('wishlist/v2/getItemsWithOffset %j', e);
        filters = [];
      }
    }

    if (priceCats) {
      filters.priceCats = priceCats;
    }

    const items = await SteamItemController.getItemsInRangeV2(
      {
        user: req.user,
        offset: req.body.offset,
        limit: req.body.limit,
        filters,
      },
      true,
      {
        users: sortByUsers,
        price: sortByPrice,
      },
    );
    const newItemStructure = [];
    if (!items) {
      res.json({
        status: 'success',
        steamItems: [],
      });
      return;
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.float === null || item.float === undefined || item.float === 'wait...') {
        item.float = 'unavailable';
      }
      newItemStructure.push({
        _id: item._id,
        price: {
          steam: {
            mean: Math.round(item.prices.mean * 100),
            safe: Math.round(item.prices.mean * 100),
          },
        },
        userSteamId: 'no',
        appid: item.appid,
        amount: item.usersCount || 1,
        assetid: 'no',
        classid: 'no',
        contextid: `${item.contextid || 2}`,
        instanceid: 'no',
        marketable: true,
        tradable: true,
        market_tradable_restriction: 0,
        name: item.market_hash_name,
        image_small: (item.image || '').replace('https://steamcommunity-a.akamaihd.net/economy/image/', ''),
        image_large: (item.image || '').replace('https://steamcommunity-a.akamaihd.net/economy/image/', ''),
        Quality: item.Quality,
        QualityName: item.QualityName,
        QualityColor: item.QualityColor,
        Rarity: item.Rarity,
        RarityColor: item.RarityColor,
        RarityName: item.RarityName,
        Hero: item.Hero,
        Slot: item.Slot,
        Type: item.Type,
        ItemSet: item.ItemSet,
        ItemSetName: item.ItemSetName,
        Weapon: item.Weapon,
        ExteriorMin: getNameAndTag(item).tag,
        Exterior: item.Exterior,
        steamcat: item.steamcat,
        itemclass: item.itemclass,
        Game: item.Game,
        GameName: item.GameName,
        droprate: item.droprate,
        droprateName: item.droprateName,
        item_class: item.item_class,
        item_className: item.item_className,
        paintWear: item.float === 'unavailable' ? null : parseFloat(item.float.substr(0, 10)),
        float: item.float === 'unavailable' ? null : item.float.substr(0, 10),
      });
    }

    const result = { status: 'success', steamItems: newItemStructure };
    if (redisClient) {
      redisClient.setex(req.redisToken, 30, JSON.stringify(result));
    }
    res.json(result);
  }

  static async userExchangeGetItemsWithOffset(req, res) {
    let filters = req.body.filters;

    if (typeof filters === 'string') {
      try {
        filters = JSON.parse(req.body.filters);
      } catch (e) {
        logger.error('exchange/getItemsWithOffset %j', e);
        res.json({ status: 'error', message: 'cannot parse filters' });
        return;
      }
    }
    if (filters && filters['753']) {
      delete filters['753'];
    }
    if (filters && filters['252490']) {
      delete filters['252490'];
    }
    const offset = req.body.offset;
    const limit = req.body.limit;

    const userItems = await getUserItems({
      limit,
      offset,
      filters,
      user: req.user,
    });

    const itemsAssetIds = await AuctionController.getUsedItems(req.user);

    if (userItems) {
      for (let i = 0; i < userItems.length; i++) {
        const gameName = config.steam.games_names[userItems[i].appid];
        if (!req.user.bans) {
          req.user.bans = {};
        }
        if (req.user.bans[gameName]) {
          userItems[i].tradable = false;
        }
        if (itemsAssetIds && itemsAssetIds.filter(it => it.assetid === userItems[i].assetid).length > 5) {
          userItems[i].tradable = false;
        }
      }
    }

    const result = {
      status: 'success',
      offset: userItems.length,
      userItems,
    };
    if (redisClient) {
      redisClient.setex(req.redisToken, 30, JSON.stringify(result));
    }
    res.json(result);
  }

  static async userGetPublicUserInfo(req, res) {
    const partnerSteamId = req.params.steamId;
    res.json({
      status: 'success',
      success: true,
      info: await UserController.getPublicInfo(req.user, partnerSteamId),
    });
  }

  static async getMoneyCount(req, res) {
    res.json({
      status: 'success',
      result: Math.floor(req.user.money) || 0,
    });
  }
};
