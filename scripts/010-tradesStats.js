require('../logger');
const Trade = require('../src/models/Trade');

/*
 взять трейды
 1. позже месяца назад
 2. взять все скины
 3. собрать массив игра - скин - количество
 4. status: finished
*/

const startDate = Date.now() - 14 * 24 * 60 * 60 * 1000;

Trade.find(
  { createdAt: { $gte: startDate }, status: { $ne: 'finished' } },
  {
    items: 1,
    itemsPartner: 1,
  },
).then(trades => {
  console.log('trades:', trades.length);

  const results = {
    '570': {},
    '730': {},
  };

  trades.forEach(trade => {
    if (!trade) return;
    if (!trade.items) trade.items = [];
    if (!trade.itemsPartner) trade.itemsPartner = [];
    // [].concat(trade.items, trade.itemsPartner).forEach(item => {
    trade.items.forEach(item => {
      if (!item.appid) {
        // console.error('items no appid');
        return;
      }
      if (!item.name) {
        // console.error('items no name');
        return;
      }
      if (!results[item.appid]) {
        results[item.appid] = {};
      }
      if (!results[item.appid][item.name]) {
        results[item.appid][item.name] = 0;
      }
      results[item.appid][item.name]++;
    });
    trade.itemsPartner.forEach(item => {
      if (!item.appid) {
        // console.error('itemsPartner no appid');
        return;
      }
      if (!item.name) {
        // console.error('itemsPartner no name');
        return;
      }
      if (!results[item.appid]) {
        results[item.appid] = {};
      }
      if (!results[item.appid][item.name]) {
        results[item.appid][item.name] = 0;
      }
      results[item.appid][item.name]++;
    });
  });

  Object.keys(results['570']).forEach(key => {
    if (results['570'][key] < 200) {
      delete results['570'][key];
    }
  });
  Object.keys(results['730']).forEach(key => {
    if (results['730'][key] < 200) {
      delete results['730'][key];
    }
  });
  console.log('keys', Object.keys(results).length);
  console.log('570', Object.keys(results['570']).length);
  console.log('730', Object.keys(results['730']).length);
  console.log('DOTA', results['570']);
  console.log('CSGO', results['730']);

  logger.info('Done!');
  process.exit(1);
});
