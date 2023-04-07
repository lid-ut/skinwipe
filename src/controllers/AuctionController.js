const config = require('../../config');
const Auction = require('../models/Auction');
const UserNews = require('../models/UserNews');
const User = require('../models/User');
const UserSteamItems = require('../models/UserSteamItems');
const Comment = require('../models/Comment');
const getNameAndTag = require('../helpers/getNameAndTag');
const changeRating = require('../helpers/changeRating');
const processItem = require('../helpers/processItem');
const obsceneFilter = require('../helpers/obsceneFilter');
const getShortUserInfo = require('../helpers/getShortUserInfo');

const getUserBySteamId = async steamId => {
  if (!steamId) {
    logger.error('no steamid');
    return null;
  }
  const user = await User.findOne({ steamId }).lean();
  if (!user) {
    logger.error('no user');
    return null;
  }
  return user;
};

module.exports = class AuctionController {
  static async createV2(user, itemsAssetIds, message, premium, paid) {
    const userInvs = await UserSteamItems.find({ steamId: user.steamId }).lean();
    const items = [];
    userInvs.forEach(userInv => {
      userInv.steamItems.forEach(item => {
        item.paintWear = item.float;
        if (item.float && item.float !== 'unavailable' && item.float !== 'wait...') {
          item.floatInt = Math.floor(parseFloat(item.paintWear) * 1000);
        }
        if (itemsAssetIds.indexOf(item.assetid) !== -1) {
          items.push(item);
        }
      });
    });

    if (!items.length) {
      return null;
    }

    if (message && message.length) {
      message = obsceneFilter(message);
      if (
        message
          .toLowerCase()
          .replace(/[\s_.,\-~=+\\/]*/g, '')
          .indexOf(user.myInvitationCode) > -1
      ) {
        message = '[censored]';
      }
      if (message.length > 128) {
        message = `${message.substr(0, 128)}...`;
      }
    }

    const auction = new Auction();

    if (premium || user.subscriber) {
      auction.premium = true;
      auction.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }
    auction.user = user;
    auction.subscriber = user.subscriber;
    auction.steamId = user.steamId;
    auction.allSkinsPrice = items.reduce((sum, cur) => parseInt(sum || 0, 10) + parseInt(cur.price.steam.safe || 0, 10), 0);
    auction.status = 'open';
    auction.paid = paid;
    auction.items = items;
    if (message && message.length && message !== 'null') {
      auction.message = message;
    }
    auction.bets = [];
    auction.dateCreate = new Date();
    await auction.save();
    await UserNews.create(user.steamId, 'auction', auction);
    await changeRating(user.steamId, config.ratingSettings.auctionCreate);
    return auction;
  }

  static async getUsedItems(user) {
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
  }

  static async getV2(user, auctionId) {
    const auction = await Auction.findOne({ _id: auctionId }).populate('user bets.user').lean().exec();
    if (!auction || !auction.bets) {
      return { error: { code: 777, message: 'no auction' } };
    }
    return { result: await AuctionController.fillV2(auction, user.steamId), error: null };
  }

  static async fillV2(auction, steamId) {
    if (!auction || !auction.bets) {
      return { error: { code: 777, message: 'no auction' } };
    }
    if (!auction.user) {
      auction.user = await getUserBySteamId(auction.steamId);
    }
    if (!auction.user) {
      return { error: { code: 787, message: 'no auction user' } };
    }
    const itemsAuctions = [];
    for (let i = 0; i < auction.items.length; i++) {
      const item = auction.items[i];
      if (!item) {
        // eslint-disable-next-line no-continue
        continue;
      }
      let imageSmall = '';
      let imageLarge = '';

      if (item.image) {
        imageSmall = item.image;
        imageLarge = item.image;
      }
      if (item.image_small) {
        imageSmall = item.image_small;
      }

      if (item.image_large) {
        imageLarge = item.image_large;
      }

      if (item.price) {
        item.price = {
          steam: {
            mean: Math.round(item.price.steam.mean || 0),
            safe: Math.round(item.price.steam.mean || 0),
          },
        };
      } else {
        item.price = {
          steam: {
            mean: 0,
            safe: 0,
          },
        };
      }

      if (item.float && !item.paintWear) {
        item.paintWear = item.float;
      }
      itemsAuctions.push({
        name: getNameAndTag(item).name,
        image_small: imageSmall.replace('https://steamcommunity-a.akamaihd.net/economy/image/', ''),
        image_large: imageLarge.replace('https://steamcommunity-a.akamaihd.net/economy/image/', ''),
        userSteamId: item.userSteamId || '', // Какому юзеру принадлежит
        appid: parseInt(item.appid, 10) || 570,
        amount: 1, // Количество, для предметов имеющих данную величину
        assetid: item.assetid,
        contextid: `${item.contextid || 2}`,

        marketable: true, // 0 - нельзя продать, 1 - можно продать
        tradable: true, // Возможность передать предмет
        market_tradable_restriction: 0, // Дней бана после обмена

        Quality: item.Quality || item.quality_name, // CSGO, Dota2
        QualityName: item.QualityName || item.quality_type, // CSGO, Dota2
        QualityColor: item.QualityColor || item.border_color, // CSGO, Dota2
        Rarity: item.rarity || item.Rarity, // CSGO, Dota2
        RarityName: item.rarity || item.Rarity, // CSGO, Dota2
        RarityColor: item.rarity_color || item.RarityColor, // CSGO, Dota2
        Type: item.Type || 'no', // CSGO, Dota2
        Slot: item.Slot || 'no', // Dota2
        Hero: item.Hero || 'no', // Dota2
        Weapon: item.Weapon || 'no', // CSGO
        ItemSet: item.ItemSet || 'no', // CSGO
        ItemSetName: item.ItemSetName || 'no', // CSGO
        ExteriorMin: getNameAndTag(item).tag, // CSGO
        Exterior: item.Exterior,
        stickerPics: item.stickerPics || [], // CSGO
        stickerNames: item.stickerNames || [], // CSGO
        runePics: item.runePics || [], // DOTA
        runeNames: item.runeNames || [], // DOTA
        runeTypes: item.runeTypes || [], // DOTA
        nameTag: item.nameTag, // CSGO
        steamcat: item.steamcat,
        itemclass: item.itemclass,
        Game: item.Game,
        GameName: item.GameName,
        droprate: item.droprate,
        droprateName: item.droprateName,
        item_class: item.item_class,
        item_className: item.item_className,
        paintWear: item.paintWear === 'wait...' || item.paintWear === 'unavailable' ? null : parseFloat(item.paintWear),
        price: item.price,
      });
    }

    auction.comments = await Comment.find({ entityType: 'auction', entityId: auction._id.toString() }).populate('user');

    if (auction.minSkinPrice && parseInt(auction.minSkinPrice, 10) !== auction.minSkinPrice && auction.minSkinPrice % 1 !== 0) {
      auction.minSkinPrice = parseInt(auction.minSkinPrice.toFixed(2), 10) * 100;
    }
    if (auction.minBetPrice && parseInt(auction.minBetPrice, 10) !== auction.minBetPrice && auction.minBetPrice % 1 !== 0) {
      auction.minBetPrice = parseInt(auction.minBetPrice.toFixed(2), 10) * 100;
    }

    const auctionItem = {
      _id: auction._id,
      status: auction.status,

      createdAt: auction.createdAt,
      timeAgo: Math.floor((Date.now() - new Date(auction.createdAt).getTime()) / 1000),
      expiresAt: new Date(auction.expiresAt || new Date(auction.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),

      steamId: auction.steamId,
      user: getShortUserInfo(auction.user),

      allSkinsPrice: auction.allSkinsPrice,
      items: itemsAuctions,

      message: !auction.user.chatBanned ? auction.message : '',
      premium: auction.premium || auction.user.subscriber,

      disableComments: !!auction.disableComments,
      games: auction.games || ['730', '570'],
      minSkinPrice: auction.minSkinPrice || 0,
      minBetPrice: auction.minBetPrice || 0,

      likes: (auction.likes || []).length,
      didILikeThis: !!(auction.likes || []).find(like => like === steamId),

      comments: (auction.comments || []).map(com => {
        return {
          _id: com._id,
          date: com.createdAt,
          comment: com.comment,
          steamId: com.steamId,
          personaname: com.user.personaname,
          avatar: com.user.avatarfull,
          subscriber: com.user.subscriber,
        };
      }),

      bets: [],
    };

    if (auction.bets) {
      auction.bets.forEach(async bItem => {
        if (!bItem.steamId) return;
        const trade = bItem.tradeObject;
        if (!trade) return;
        if (!trade.myAllSkinsPrice) return;
        if (!trade.status) return;
        if (!auctionItem.user) return;
        let betUser = bItem.user;
        if (!betUser) {
          betUser = await getUserBySteamId(bItem.steamId);
        }
        if (!betUser) return;
        auctionItem.bets.push({
          createdAt: new Date(parseInt((bItem._id || auction._id).toString().substring(0, 8), 16) * 1000),
          steamId: bItem.steamId,
          user: getShortUserInfo(betUser),
          trade,
        });
      });
      for (let j = 0; j < auctionItem.bets.length; j++) {
        const bItem = auctionItem.bets[j];
        bItem.trade.user1 = bItem.user;
        bItem.trade.user2 = auctionItem.user;
        const trade = bItem.trade;

        const items = [];
        const itemsPartner = [];

        for (let i = 0; i < trade.items.length; i++) {
          // eslint-disable-next-line no-await-in-loop
          items.push(await processItem(trade.items[i]));
        }
        for (let i = 0; i < auction.items.length; i++) {
          // eslint-disable-next-line no-await-in-loop
          itemsPartner.push(await processItem(auction.items[i]));
        }
        items.sort(AuctionController.sortItemsByPrice);
        itemsPartner.sort(AuctionController.sortItemsByPrice);
        bItem.trade = {
          _id: trade._id,
          steamId: bItem.trade.user2.steamId,
          steamIdPartner: bItem.trade.user1.steamId,
          user: bItem.trade.user2,
          partner: bItem.trade.user1,
          items,
          itemsPartner,
          myAllSkinsPrice: Math.round(trade.hisAllSkinsPrice),
          hisAllSkinsPrice: Math.round(trade.myAllSkinsPrice),
          status: trade.status,
          steamTradeStatus: trade.steamTradeStatus,
          steamTradeID: trade.steamTradeID,
        };
        auctionItem.bets[j] = bItem;
      }
      auctionItem.bets.sort(AuctionController.sortByPrice2);
    }

    auctionItem.items.sort(AuctionController.sortItemsByPrice);
    return auctionItem;
  }

  static async get(user, auctionId) {
    const auction = await Auction.findOne({ _id: auctionId }).populate('user bets.user').exec();
    if (!auction || !auction.bets) {
      return { error: { code: 777, message: 'no auction' } };
    }
    auction.bets.forEach(bItem => {
      if (bItem.tradeObject.status === 'reject') {
        auction.bets.splice(auction.bets.indexOf(bItem), 1);
      }
    });
    auction.bets.forEach(bItem => {
      bItem.tradeObject.user1 = bItem.user;
      bItem.tradeObject.user2 = auction.user;

      bItem.tradeObject.user1 = bItem.user;
      bItem.tradeObject.user2 = auction.user;

      const trade = bItem.tradeObject;
      const user1 = trade.user1;
      const user2 = trade.user2;

      if (user1) {
        user1.subInfo = [];
        user1.wishlist = [];
        user1.exchange = [];
        user1.games = [];
        user1.xAccessToken = [];
        user1.firebaseTokens = [];
      }

      if (user2) {
        user2.subInfo = [];
        user2.wishlist = [];
        user2.exchange = [];
        user2.games = [];
        user2.xAccessToken = [];
        user2.firebaseTokens = [];
      }

      bItem.trade = {
        _id: trade._id,
        steamId: user2.steamId,
        steamIdPartner: user2.steamId,
        autoTrade: !!trade.autoTrade,
        // "user1": trade.user1,
        user: user2,
        partner: user1,
        items: trade.items,
        itemsPartner: trade.itemsPartner,
        myAllSkinsPrice: trade.hisAllSkinsPrice,
        hisAllSkinsPrice: trade.myAllSkinsPrice,
        surcharge: 0,
        userSurcharge: 'me',
        status: trade.status,
        close: trade.close,
        userClose: trade.userClose,
        isOpened: trade.isOpened,
        steamTradeStatus: trade.steamTradeStatus,
        steamTradeID: trade.steamTradeID,
        steamTradeComment: trade.steamTradeComment,
        steamLastSendPushCheck: trade.steamLastSendPushCheck,
        steamSendPushCount: trade.steamSendPushCount,
      };
    });
    auction.bets.sort(AuctionController.sortByPrice1);
    return { result: auction, error: null };
  }

  static sortItemsByPrice(a, b) {
    if (!a.price || !a.price.steam || !a.price.steam.mean) {
      return -1;
    }
    if (!b.price || !b.price.steam || !b.price.steam.mean) {
      return 1;
    }
    if (a.price.steam.mean < b.price.steam.mean) {
      return 1;
    }
    if (a.price.steam.mean > b.price.steam.mean) {
      return -1;
    }
    return 0;
  }

  static sortByPrice1(a, b) {
    if (a.trade.hisAllSkinsPrice < b.trade.hisAllSkinsPrice) {
      return 1;
    }
    if (a.trade.hisAllSkinsPrice > b.trade.hisAllSkinsPrice) {
      return -1;
    }
    return 0;
  }

  static sortByPrice2(a, b) {
    if (!(a.trade && b.trade)) return -1;

    if (a.trade.hisAllSkinsPrice < b.trade.hisAllSkinsPrice) {
      return 1;
    }
    if (a.trade.hisAllSkinsPrice > b.trade.hisAllSkinsPrice) {
      return -1;
    }
    return 0;
  }
};
