const processItem = require('./processItem');
const getShortUserInfo = require('./getShortUserInfo');

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

module.exports = async function formatChatTrade(trade, user, partner) {
  if (!trade) {
    return {};
  }
  let tradeUser = user;
  let tradePartner = partner;
  if (trade.steamId !== user.steamId) {
    tradeUser = partner;
    tradePartner = user;
  }
  trade.money = {
    count: trade.money,
    img: '',
  };
  trade.items.sort(sortItemsByPrice);
  trade.itemsPartner.sort(sortItemsByPrice);
  return {
    _id: trade._id,
    steamId: trade.steamId,
    steamIdPartner: trade.steamIdPartner,
    autoTrade: !!trade.autoTrade,
    user: getShortUserInfo(tradeUser),
    partner: getShortUserInfo(tradePartner),
    items: await Promise.all(trade.itemsPartner.map(item => processItem(item))),
    itemsPartner: await Promise.all(trade.items.map(item => processItem(item))),
    myAllSkinsPrice: trade.myAllSkinsPrice,
    hisAllSkinsPrice: trade.hisAllSkinsPrice,
    surcharge: 0,
    userSurcharge: 'me',
    status: trade.status,
    close: trade.close,
    money: trade.money,
    userClose: trade.userClose,
    isOpened: trade.isOpened,
    steamTradeStatus: trade.steamTradeStatus,
    steamTradeID: trade.steamTradeID,
    steamTradeComment: trade.steamTradeComment,
    steamLastSendPushCheck: trade.steamLastSendPushCheck,
    steamSendPushCount: trade.steamSendPushCount,
    datecteate: trade.datecreate,
  };
};
