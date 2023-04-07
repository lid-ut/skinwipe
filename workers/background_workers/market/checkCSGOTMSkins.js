const fetch = require('node-fetch');

const MarketTrade = require('../../../src/models/MarketTrade');
const changeTransaction = require('../../../src/modules/money/transaction/change');

const getInfoListCSGOTM = async (csgotmKey, cIds) => {
  try {
    const url = `https://market.csgo.com/api/v2/get-list-buy-info-by-custom-id?key=${csgotmKey}&${cIds
      .map(cId => `&custom_id[]=${encodeURI(cId)}`)
      .join('')}`;

    const res = await fetch(url);
    return res.json();
  } catch (e) {
    console.log(e);
  }
  return [];
};

module.exports = async () => {
  const marketTrades = await MarketTrade.find({
    type: 'csgotm',
    $or: [{ csgotmStatus: 'wait' }, { csgotmStatus: 'sent' }],
  });
  const groups = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const trade of marketTrades) {
    const i = groups.findIndex(it => it.csgotmKey === trade.csgotmKey);
    if (i !== -1) {
      groups[i].cIds.push(trade._id.toString());
    } else {
      groups.push({
        csgotmKey: trade.csgotmKey,
        cIds: [trade._id.toString()],
      });
    }
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const group of groups) {
    // eslint-disable-next-line no-await-in-loop
    const res = await getInfoListCSGOTM(group.csgotmKey, group.cIds);

    if (res.success) {
      // eslint-disable-next-line no-restricted-syntax
      for (const cId of group.cIds) {
        const data = res.data[cId];
        // eslint-disable-next-line no-continue
        if (!data) continue;

        // eslint-disable-next-line default-case
        switch (data.stage) {
          case '1':
            if (data.trade_id) {
              // eslint-disable-next-line no-await-in-loop
              await MarketTrade.updateOne(
                { _id: cId },
                {
                  $set: {
                    status: 'wait',
                    csgotmStatus: 'sent',
                    steamTradeId: data.trade_id,
                  },
                },
              );
            }
            break;
          case '2':
            // eslint-disable-next-line no-await-in-loop
            await MarketTrade.updateOne(
              { _id: cId },
              {
                $set: {
                  status: 'done',
                  csgotmStatus: 'done',
                },
              },
            );

            // eslint-disable-next-line no-await-in-loop
            await changeTransaction(cId, 'done');
            break;
          case '5':
            // eslint-disable-next-line no-await-in-loop
            await MarketTrade.updateOne(
              { _id: cId },
              {
                $set: {
                  status: 'close',
                  csgotmStatus: 'close',
                  closeReason: 'seller not send item',
                },
              },
            );

            // eslint-disable-next-line no-await-in-loop
            await changeTransaction(cId, 'close', 'seller not send item');
            break;
        }
      }
    }
  }
};
