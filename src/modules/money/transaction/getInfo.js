module.exports = tran => {
  switch (tran.type) {
    case 'invite':
      return {
        type: 'promo',
      };
    case 'promo':
      return {
        type: 'promo',
      };
    case 'admin_add':
      return {
        type: 'supportchat',
      };
    case 'restore_balance':
      return {
        type: 'supportchat',
      };
    case 'ykassa_add':
      return {
        type: 'addmoney',
      };

    case 'buy_market_p2p':
      return {
        type: 'addmoney',
        direction: 'in',
      };
    case 'sell_market_p2p':
      return {
        type: 'marketp2ptrade',
        direction: 'out',
      };

    case 'buy_market_bot':
      return {
        type: 'marketbot',
        direction: 'in',
      };
    case 'sell_market_bot':
      return {
        type: 'marketbot',
        direction: 'out',
      };

    case 'buy_market_bot_virtual':
      return {
        type: 'marketbotvirtual',
        direction: 'in',
      };
    case 'sell_market_bot_virtual':
      return {
        type: 'marketbotvirtual',
        direction: 'out',
      };

    case 'buy_trade_p2p':
      return {
        type: 'p2ptrade',
        direction: 'in',
      };
    case 'sell_trade_p2p':
      return {
        type: 'p2ptrade',
        direction: 'out',
      };

    case 'buy_trade_p2p_direct':
      return {
        type: 'p2ptrade',
        direction: 'in',
      };
    case 'sell_trade_p2p_direct':
      return {
        type: 'p2ptrade',
        direction: 'out',
      };

    case 'buy_supertrade_p2p':
      return {
        type: 'p2psupertrade',
        direction: 'in',
      };
    case 'sell_supertrade_p2p':
      return {
        type: 'p2psupertrade',
        direction: 'out',
      };
    default:
      return {
        type: 'other',
      };
  }
};
