module.exports = (steamTrade, seller, buyer) => {
  let status = 'check';
  let reason = '';
  let user;

  if (!steamTrade.trade_offer_state) {
    steamTrade.trade_offer_state = steamTrade.status;
  }
  // eslint-disable-next-line default-case
  switch (steamTrade.trade_offer_state) {
    case 1: // Invalid
      status = 'close';
      reason = 'Ошибка steam, просим повторить сделку позже';
      break;
    case 2: // This trade offer has been sent, neither party has acted on it yet.
      status = 'check';
      break;
    case 3: // The trade offer was accepted by the recipient and items were exchanged.
      status = 'done';
      break;
    case 4: // The recipient made a counter offer
      status = 'close';
      reason = 'Продавец отклонил трейд в steam с наружением правил системы';
      user = seller;
      break;
    case 5: // The trade offer was not accepted before the expiration date
      status = 'close';
      reason = 'Продавец отклонил трейд в steam с наружением правил системы';
      user = seller;
      break;
    case 6: // The sender cancelled the offer
      status = 'close';
      reason = 'Покупатель отклонил трейд в steam';
      user = buyer;
      break;
    case 7: // The recipient declined the offer
      status = 'close';
      reason = 'Продавец отклонил трейд в steam';
      user = seller;
      break;
    case 8: // Some of the items in the offer are no longer available (indicated by the missing flag in the output)
      status = 'close';
      reason = 'Продавец отклонил трейд в стим. Скин больше не доступен для обмена';
      user = seller;
      break;
    case 9: // The offer hasn't been sent yet and is awaiting email/mobile confirmation. The offer is only visible to the sender.
      status = 'check';
      console.log(`FIND 9 STATUS FOR ${steamTrade}`);
      break;
    case 10: // Either party canceled the offer via email/mobile. The offer is visible to both parties, even if the sender canceled it before it was sent.
      status = 'close';
      reason = 'Продавец отклонил трейд в steam';
      user = seller;
      break;
    case 11: // The trade has been placed on hold. The items involved in the trade have all been removed from both parties' inventories and will be automatically delivered in the future.
      status = 'wait';
      reason = 'Сделка приостановлена на 15 дней, у одного из пользователей отсутствует мобильный guard';
      break;
  }

  return {
    status,
    user,
    reason,
  };
};
