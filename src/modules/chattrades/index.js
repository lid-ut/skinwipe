const MessageTrade = require('../../models/MessageTrade');
const getShortUserInfo = require('../../helpers/getShortUserInfo');
const UserController = require('../../controllers/UserController');
const processItem = require('../../helpers/processItem');

const sortItemsByPrice = (a, b) => {
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
};

const addFiltersToQuery = (query, params) => {
  const findObj = {
    ...query,
  };
  if (params.filters) {
    if (params.filters.price && (params.filters.price.min || params.filters.price.max)) {
      findObj.myAllSkinsPrice = {
        $gte: params.filters.price.min || 0,
        $lte: params.filters.price.max || 9999999,
      };
    }

    if (params.filters.name && params.filters.name.length) {
      if (/^[a-zA-Z0-9|\s()™★-]*$/.test(params.filters.name)) {
        if (!findObj.items) {
          findObj.items = {
            $elemMatch: {},
          };
        }
        findObj.items.$elemMatch.name = {
          $regex: params.filters.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
          $options: 'i',
        };
      }
    }

    if (params.filters.dota2) {
      if (!findObj.items) {
        findObj.items = {
          $elemMatch: {},
        };
      }
      findObj.items.$elemMatch.appid = 570;

      if (params.filters.dota2.assetid && params.filters.dota2.assetid.length && !isAutoTrade) {
        findObj.items.$elemMatch.assetid = {
          $in: params.filters.dota2.assetid,
        };
      }
      if (params.filters.dota2.type && params.filters.dota2.type.length) {
        findObj.items.$elemMatch.Type = {
          $regex: params.filters.dota2.type.join('|'),
        };
      }
      if (params.filters.dota2.quality && params.filters.dota2.quality.length) {
        findObj.items.$elemMatch.Quality = {
          $regex: params.filters.dota2.quality.join('|'),
        };
      }
      if (params.filters.dota2.rarity && params.filters.dota2.rarity.length) {
        findObj.items.$elemMatch.Rarity = {
          $regex: params.filters.dota2.rarity.join('|'),
        };
      }
      if (params.filters.dota2.hero && params.filters.dota2.hero.length) {
        findObj.items.$elemMatch.Hero = {
          $regex: params.filters.dota2.hero.join('|'),
        };
      }
      if (params.filters.dota2.slot && params.filters.dota2.slot.length) {
        findObj.items.$elemMatch.Slot = {
          $regex: params.filters.dota2.slot.join('|'),
        };
      }
      if (params.filters.dota2.runeNames && params.filters.dota2.runeNames.length) {
        findObj.items.$elemMatch.runeNames = {
          $elemMatch: {
            $regex: params.filters.dota2.runeNames.join('|'),
          },
        };
      }
    }

    if (params.filters.csgo) {
      if (!findObj.items) {
        findObj.items = {
          $elemMatch: {},
        };
      }
      findObj.items.$elemMatch.appid = 730;
      if (params.filters.csgo.assetid && params.filters.csgo.assetid.length) {
        findObj.items.$elemMatch.assetid = {
          $in: params.filters.csgo.assetid,
        };
      }
      if (params.filters.csgo.float && (params.filters.csgo.float.from !== 0 || params.filters.csgo.float.to !== 1000)) {
        findObj.items.$elemMatch.float = {
          $ne: null,
        };
        if (params.filters.csgo.float.from) {
          findObj.items.$elemMatch.float.$gte = (params.filters.csgo.float.from / 1000).toString();
        }
        if (params.filters.csgo.float.to) {
          findObj.items.$elemMatch.float.$lte = (params.filters.csgo.float.to / 1000).toString();
        }
      }
      if (params.filters.csgo.statTrack) {
        findObj.items.$elemMatch.Quality = 'stattrak™';
      }
      if (params.filters.csgo.weapon && params.filters.csgo.weapon.length) {
        findObj.items.$elemMatch.Weapon = {
          $regex: params.filters.csgo.weapon.join('|'),
        };
      }
      if (params.filters.csgo.exterior && params.filters.csgo.exterior.length) {
        findObj.items.$elemMatch.Exterior = {
          $regex: params.filters.csgo.exterior.join('|'),
        };
      }
      if (params.filters.csgo.stickerCount) {
        findObj.items.$elemMatch.stickerNames = {
          $size: params.filters.csgo.stickerCount,
        };
      }
      if (params.filters.csgo.stickerNames && params.filters.csgo.stickerNames.length) {
        findObj.items.$elemMatch.stickerNames = {
          ...(findObj.items.$elemMatch.stickerNames || {}),
          // eslint-disable-next-line no-useless-escape
          $regex: params.filters.csgo.stickerNames.map(item => item.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|'),
          $options: 'i',
        };
      }
      if (params.filters.csgo.quality && params.filters.csgo.quality.length) {
        findObj.items.$elemMatch.Quality = {
          $regex: params.filters.csgo.quality.join('|'),
        };
      }
      if (params.filters.csgo.type && params.filters.csgo.type.length) {
        findObj.items.$elemMatch.Type = {
          $regex: params.filters.csgo.type.join('|'),
        };
      }
      if (params.filters.csgo.paintSeed && params.filters.csgo.paintSeed.length) {
        findObj.items.$elemMatch.float = {
          $elemMatch: {
            paintSeed: {
              $in: params.filters.csgo.paintSeed,
            },
          },
        };
      }
    }

    if (params.filters.tf2) {
      if (!findObj.items) {
        findObj.items = {
          $elemMatch: {},
        };
      }
      findObj.items.$elemMatch.appid = 440;
      if (params.filters.tf2.assetid && params.filters.tf2.assetid.length && !isAutoTrade) {
        findObj.items.$elemMatch.assetid = {
          $in: params.filters.tf2.assetid,
        };
      }
      if (params.filters.tf2.class && params.filters.tf2.class.length > 0) {
        findObj.items.$elemMatch.Class = {
          $regex: params.filters.tf2.class.join('|'),
        };
      }
      if (params.filters.tf2.quality && params.filters.tf2.quality.length) {
        findObj.items.$elemMatch.Quality = {
          $regex: params.filters.tf2.quality.join('|'),
        };
      }
      if (params.filters.tf2.weapon && params.filters.tf2.weapon.length) {
        findObj.items.$elemMatch.Weapon = {
          $regex: params.filters.tf2.weapon.join('|'),
        };
      }
      if (params.filters.tf2.type && params.filters.tf2.type.length) {
        findObj.items.$elemMatch.Type = {
          $regex: params.filters.tf2.type.join('|'),
        };
      }
    }
  }
  return findObj;
};

const processTradesListV2 = async trades => {
  return trades
    .map(trade => {
      const user1 = trade.user1;

      if (!user1) {
        // trade.remove();
        logger.error(`trade dont have user1 ${trade._id}`);
        return null;
      }

      let user2 = trade.user2;

      trade.items = (trade.items || []).map(item => {
        return {
          ...item,
          appid: parseInt(item.appid, 10),
        };
      });
      trade.itemsPartner = (trade.itemsPartner || []).map(item => {
        return {
          ...item,
          appid: parseInt(item.appid, 10),
        };
      });

      if (!user2) user2 = {};

      trade.items.sort(sortItemsByPrice);
      trade.itemsPartner.sort(sortItemsByPrice);

      return {
        _id: trade._id,
        money: {
          count: trade.money,
          img: '',
        },
        steamId: trade.steamId,
        steamIdPartner: trade.steamIdPartner,
        autoTrade: !!trade.autoTrade,
        timeAgo: Math.floor((Date.now() - new Date(trade.createdAt).getTime()) / 1000),
        user: getShortUserInfo(user1),
        partner: getShortUserInfo(user2),
        items: trade.items,
        itemsPartner: trade.itemsPartner,
        myAllSkinsPrice: trade.myAllSkinsPrice,
        hisAllSkinsPrice: trade.hisAllSkinsPrice,
        surcharge: 0,
        userSurcharge: 'me',
        premium: trade.premium,
        status: trade.status,
        close: trade.close,
        userClose: trade.userClose,
        isOpened: trade.isOpened,
        steamTradeStatus: trade.steamTradeStatus,
        steamTradeID: trade.steamTradeID,
        steamTradeComment: trade.steamTradeComment,
        steamLastSendPushCheck: trade.steamLastSendPushCheck,
        steamSendPushCount: trade.steamSendPushCount,
        datecteate: trade.datecreate,
        likes: trade.likes || [],
        views: trade.views || 0,
      };
    })
    .filter(trade => !!trade);
};

const generateAllTradesParams = (user, params) => {
  const steamId = user.steamId;

  let result;
  switch (params.type) {
    case 'my':
      result = {
        status: 'new',
        steamId,
      };
      break;
    case 'partner':
      result = {
        status: 'new',
        steamIdPartner: steamId,
      };
      if (params.sortBy) {
        result.steamId = {
          $ne: steamId,
        };
      }
      break;
    default:
      result = {
        status: 'new',
        $or: [
          {
            steamId,
          },
          {
            steamIdPartner: steamId,
          },
        ],
      };
      if (params.sortBy) {
        result.steamId = {
          $ne: steamId,
        };
      }
      break;
  }

  result = addFiltersToQuery(result, params);
  return result;
};

const getAllTradesV2 = async (user, params) => {
  const findObj = generateAllTradesParams(user, params);
  const trades = await MessageTrade.find(findObj)
    .populate('user1 user2')
    .sort({ createdAt: -1 })
    .skip(params.offset || 0)
    .limit(params.limit || 10)
    .lean()
    .exec();

  if (!trades) {
    return [];
  }

  return processTradesListV2(trades);
};

module.exports = async (req, res) => {
  const params = { filters: {}, limit: parseInt(req.body.limit, 10) || 10, offset: parseInt(req.body.offset, 10) || 0 };
  if (req.body.type) params.type = req.body.type;
  if (req.body.sortBy) params.sortBy = req.body.sortBy;
  if (req.body.sortOrder) params.sortOrder = req.body.sortOrder;
  if (req.body.filters) params.filters = req.body.filters;
  if (params.limit > 50) {
    params.limit = 50;
  }
  let trades = await getAllTradesV2(req.user, params);

  trades = await Promise.all(
    trades.map(async trade => {
      if (!trade.items) trade.items = [];
      if (!trade.itemsPartner) trade.itemsPartner = [];
      trade.items = await Promise.all(trade.items.map(item => processItem(item)));
      trade.itemsPartner = await Promise.all(trade.itemsPartner.map(item => processItem(item)));
      trade.didILikeThis = !!(trade.likes || []).find(like => like === req.user.steamId);
      trade.likes = (trade.likes || []).length;
      trade.views = trade.views || 0;
      return trade;
    }),
  );

  res.json({
    status: 'success',
    result: trades,
  });
};
