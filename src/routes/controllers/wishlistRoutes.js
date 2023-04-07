const SteamItemController = require('../../controllers/SteamItemController');
const WishLists = require('../../models/WishLists');
const TradesController = require('../../controllers/TradesController');
const getNameAndTag = require('../../helpers/getNameAndTag');

module.exports = class WishlistRoutes {
  static async getItems(req, res) {
    let filters = req.body.filters;

    if (typeof filters === 'string') {
      try {
        filters = JSON.parse(req.body.filters);
      } catch (e) {
        logger.error('wishlist/v2/getItemsWithOffset %j', e);
        filters = [];
      }
    }

    const items = await SteamItemController.getItemsInRangeV2(
      {
        user: req.user,
        offset: req.body.offset,
        limit: req.body.limit,
        filters,
      },
      false,
      null,
    );
    const newItemStructure = [];
    if (!items) {
      res.json({
        status: 'success',
        steamItems: newItemStructure,
      });
      return;
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      newItemStructure.push({
        price: {
          steam: {
            mean: item.prices.mean * 100,
            safe: item.prices.mean * 100,
          },
        },
        userSteamId: 'no',
        appid: item.appid,
        amount: 1,
        assetid: 'no',
        classid: 'no',
        contextid: `${item.contextid || 2}`,
        instanceid: 'no',
        marketable: true,
        tradable: true,
        market_tradable_restriction: 0,
        name: getNameAndTag(item).name,
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
        paintWear: null,
      });
    }
    res.json({
      status: 'success',
      steamItems: newItemStructure,
    });
  }

  static async getSelectedItems(req, res) {
    const steamItems = await WishLists.findOne({ steamId: req.user.steamId }).lean().exec();

    if (!steamItems || !steamItems.steamItems || !steamItems.steamItems.length) {
      res.json({
        status: 'error',
        message: 'empty items list',
      });
      return;
    }

    res.json({
      status: 'success',
      steamItems: steamItems.steamItems,
    });
  }

  static async setSelectedItems(req, res) {
    const itemsNames = req.body.itemsNames;
    const steamItems = await SteamItemController.getItemsByNames(itemsNames);

    const wishlist = (await WishLists.findOne({ steamId: req.user.steamId })) || new WishLists();
    wishlist.steamId = req.user.steamId;
    wishlist.steamItems = steamItems.map(item => {
      return {
        price: {
          steam: {
            mean: item.prices.mean * 100,
            safe: item.prices.mean * 100,
          },
        },
        userSteamId: 'no',
        appid: item.appid,
        amount: 1,
        assetid: 'no',
        classid: 'no',
        contextid: `${item.contextid || 2}`,
        instanceid: 'no',
        marketable: true,
        tradable: true,
        market_tradable_restriction: 0,
        name: getNameAndTag(item).name,
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
        priority: 0,
        paintWear: null,
      };
    });

    await wishlist.save();

    res.json({
      status: 'success',
    });
  }

  static async wishlistGetInfoForTradeWithOffset(req, res) {
    let myLimit = req.body.mylimit;
    let myOffset = req.body.myoffset;
    let hisLimit = req.body.hislimit;
    let hisOffset = req.body.hisoffset;

    if (typeof myLimit === 'string') myLimit = parseInt(myLimit, 10);
    if (typeof myOffset === 'string') myOffset = parseInt(myOffset, 10);
    if (typeof hisLimit === 'string') hisLimit = parseInt(hisLimit, 10);
    if (typeof hisOffset === 'string') hisOffset = parseInt(hisOffset, 10);

    if (myLimit > 5000) myLimit = 1000;
    if (hisLimit > 5000) hisLimit = 1000;
    if (myOffset < 0) myOffset = 0;
    if (hisOffset < 0) hisOffset = 0;

    let filters = req.body.filters || [];
    let filtersPartner = req.body.filtersPartner || [];

    if (typeof filters === 'string') {
      try {
        filters = JSON.parse(filters);
      } catch (e) {
        logger.error('getInfoForTradeWithOffset filters %j', e);
        filters = [];
      }
    }

    if (typeof filtersPartner === 'string') {
      try {
        filtersPartner = JSON.parse(filtersPartner);
      } catch (e) {
        logger.error('getInfoForTradeWithOffset filtersPartner %j', e);
        filtersPartner = [];
      }
    }

    const hisWishlist = await WishLists.findOne({ steamId: req.body.partnerSteamID }).lean().exec();
    const myWishlist = await WishLists.findOne({ steamId: req.user.steamId }).lean().exec();

    const items = await TradesController.getAllItemsDataForTrade({
      steamId: req.user.steamId,
      user: req.user,
      partnerSteamID: req.body.partnerSteamID,
      filters,
      filtersPartner,
      myLimit,
      myOffset,
      hisLimit,
      hisOffset,
      hisWishlist: hisWishlist ? hisWishlist.steamItems.map(it => it.name) : false,
      myWishlist: myWishlist ? myWishlist.steamItems.map(it => it.name) : false,
    });

    const myItems = items.myItems;
    const hisItems = items.hisItems;
    res.json({
      status: 'success',
      myItems,
      hisItems,

      myOffset: items ? items.myOffset : 0,
      hisOffset: items ? items.hisOffset : 0,

      myAllItemsCount: items ? items.myItemsCount : 0,
      hisAllItemsCount: items ? items.hisItemsCount : 0,
    });
  }
};
