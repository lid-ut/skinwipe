const Auction = require('../../models/Auction');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
const UserSkinRecommendation = require('../../models/UserSkinRecommendation');
const logFinish = require('../../helpers/logFinish');
const processItem = require('../../helpers/processItem');
const categories = require('../../modules/filters/categories');
const getShortUserInfo = require('../../helpers/getShortUserInfo');

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

const sortBetsByPrice = (a, b) => {
  if (!(a.trade && b.trade)) return -1;

  if (a.trade.hisAllSkinsPrice < b.trade.hisAllSkinsPrice) {
    return 1;
  }
  if (a.trade.hisAllSkinsPrice > b.trade.hisAllSkinsPrice) {
    return -1;
  }
  return 0;
};

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

const fillV3 = async (auction, steamId) => {
  if (!auction || !auction.bets) {
    return { error: { code: 777, message: 'no auction' } };
  }
  if (!auction.user) {
    auction.user = await getUserBySteamId(auction.steamId);
  }
  if (!auction.user) {
    return { error: { code: 787, message: 'no auction user' } };
  }
  auction.comments = await Comment.find({ entityType: 'auction', entityId: auction._id.toString() }).populate('user');

  auction.items = await Promise.all(auction.items.map(processItem));
  auction.items.sort(sortItemsByPrice);

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
    items: auction.items,

    message: !auction.user.chatBanned ? auction.message : '',
    premium: auction.premium || auction.user.subscriber,

    disableComments: !!auction.disableComments,
    games: auction.games || ['730', '570'],
    minSkinPrice: auction.minSkinPrice || 0,
    minBetPrice: auction.minBetPrice || 0,

    likes: (auction.likes || []).length,
    didILikeThis: !!(auction.likes || []).find(like => like === steamId),

    views: auction.views,

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
    auction.bets.forEach(() => {
      auctionItem.bets.push({});
    });
  }

  return auctionItem;
};

const getTopPremAuction = async (findObj, sortObj) => {
  const auctions = await Auction.find({ ...findObj, premium: true, subscriber: true, status: 'open' })
    .sort(sortObj)
    .populate('user bets.user')
    .limit(1)
    .lean()
    .exec();
  return auctions[0];
};

const getListV3 = async (user, params) => {
  let findObj = { status: 'open' }; // 'all'

  if (params.statusType === 'my') {
    findObj = { steamId: user.steamId };
  }
  if (params.statusType === 'active') {
    findObj = { 'bets.steamId': user.steamId };
  }
  if (params.statusType === 'recommended') {
    findObj = {};
  }

  if (params.filters) {
    if (params.filters.price && (params.filters.price.min || params.filters.price.max)) {
      findObj.allSkinsPrice = {
        $gte: params.filters.price.min || 0,
        $lte: params.filters.price.max || 9999999,
      };
    }

    if (params.filters.name && params.filters.name.length) {
      if (/^[a-zA-Z0-9|\s()™★-]*$/.test(params.filters.name)) {
        if (!findObj.items) {
          findObj.items = { $elemMatch: {} };
        }
        findObj.items.$elemMatch.name = {
          $regex: params.filters.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
          $options: 'i',
        };
      }
    }

    if (params.filters.dota2) {
      if (!findObj.items) {
        findObj.items = { $elemMatch: {} };
      }
      findObj.items.$elemMatch.appid = 570;
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
        findObj.items = { $elemMatch: {} };
      }
      findObj.items.$elemMatch.appid = 730;
      if (params.filters.csgo.float) {
        findObj.items.$elemMatch.float = { $ne: null };
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
          ...findObj.items.$elemMatch.stickerNames,
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
      if (params.filters.csgo.category && params.filters.csgo.category.length) {
        const cats = params.filters.csgo.category;
        let nameString = '';
        let typeString = '';
        // eslint-disable-next-line no-restricted-syntax
        for (const cat of cats) {
          if (!cat.items || cat.items.length === 0) {
            const categoryBase = categories.filter(it => it.name === cat.name)[0];
            cat.items = categoryBase ? categoryBase.items : [];
            cat.type = categoryBase ? categoryBase.type : [];
          }
          typeString = cat.type;
          if (cat.name === 'other') {
            // eslint-disable-next-line no-loop-func
            cat.items.forEach(item => {
              typeString += typeString ? `|${item}` : item;
            });
          } else {
            // eslint-disable-next-line no-loop-func
            cat.items.forEach(item => {
              nameString += nameString ? `|${item}` : item;
            });
          }
        }
        if (nameString) {
          findObj.items.$elemMatch.name = {
            $regex: nameString,
            $options: 'i',
          };
        }
        if (typeString) {
          findObj.items.$elemMatch.type = {
            $regex: typeString,
            $options: 'i',
          };
        }
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
        findObj.items = { $elemMatch: {} };
      }
      findObj.items.$elemMatch.appid = 440;
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

  const topAuction = await getTopPremAuction(findObj, { dateCreate: -1 });
  if (params.offset === 0 && topAuction) {
    params.limit -= 1;
    findObj._id = { $ne: topAuction._id };
  }

  let auctions = [];

  if (params.statusType === 'recommended') {
    const recommendedFindObj = { ...findObj };
    const recommendations = await UserSkinRecommendation.find({ steamId: user.steamId });
    let recommendedItemsNames = [];
    let recommendedAssetIds = [];
    for (let i = 0; i < recommendations.length; i++) {
      recommendedItemsNames = recommendedItemsNames.concat(recommendations[i].skinsNames);
      recommendedAssetIds = recommendedAssetIds.concat(recommendations[i].skinsAssetIds);
    }
    recommendedFindObj.items = {
      $elemMatch: {
        ...(recommendedFindObj.items && recommendedFindObj.items.$elemMatch ? recommendedFindObj.items.$elemMatch : {}),
        assetid: {
          $in: recommendedAssetIds,
        },
      },
    };

    if (recommendedItemsNames.length > 0) {
      recommendedFindObj['items.name'] = { $in: recommendedItemsNames };
    }

    auctions = await Auction.find(recommendedFindObj)
      .sort({ dateCreate: -1 })
      .populate('user')
      .limit(params.limit)
      .skip(params.offset)
      .lean()
      .exec();

    auctions = auctions.sort((a, b) => {
      const aHasRecommended = a.items.reduce((result, item) => {
        result = result || recommendedAssetIds.indexOf(item.assetid) > -1;
        return result;
      }, false);
      const bHasRecommended = b.items.reduce((result, item) => {
        result = result || recommendedAssetIds.indexOf(item.assetid) > -1;
        return result;
      }, false);
      if (aHasRecommended && !bHasRecommended) {
        return -1;
      }
      if (!aHasRecommended && bHasRecommended) {
        return 1;
      }
      return 0;
    });
  } else {
    auctions = await Auction.find(findObj).sort({ dateCreate: -1 }).populate('user').limit(params.limit).skip(params.offset).lean().exec();
  }

  if (!auctions) {
    auctions = [];
  }

  if (params.offset === 0 && topAuction) {
    auctions.unshift(topAuction);
  }

  return Promise.all(auctions.map(auction => fillV3(auction, user.steamId)));
};

module.exports = async (req, res) => {
  // eslint-disable-next-line no-undef
  if (redisClient && redisGet) {
    // eslint-disable-next-line no-undef
    const result = await redisGet(req.redisToken);
    if (result) {
      res.json(result);
      return;
    }
  }
  const params = {
    offset: 0,
    limit: 20,
    statusType: 'all',
  };
  if (req.body.limit) {
    params.limit = parseInt(req.body.limit, 10);
  }
  if (req.body.offset) {
    params.offset = parseInt(req.body.offset, 10);
  }
  if (req.body.statusType) {
    params.statusType = req.body.statusType;
  }
  if (req.body.filters) {
    params.filters = req.body.filters;
  }

  const auctions = await getListV3(req.user, params);

  if (redisClient) {
    redisClient.setex(req.redisToken, 5, JSON.stringify({ status: 'success', auctions }));
  }
  res.json({ status: 'success', auctions });
};
