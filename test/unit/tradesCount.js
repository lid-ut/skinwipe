let request = require('supertest');

const config = require('../../config.js');
const TradesController = require('../../src/controllers/TradesController');

request = request(`127.0.0.1:${config.port}`);

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('tradesCount', () => {
  describe(`/api/trade/v2/getTrades`, () => {
    it('should return trades', done => {
      Promise.all([
        TradesController.getAllTradesNew(
          {
            steamId: '76561198837772483',
          },
          {
            limit: 8,
            offset: 0,
          },
        ),
        TradesController.getAllNewTradesCount('76561198837772483'),
      ]).then(results => {
        logger.info(`results[0]: ${results[0].length}`);
        logger.info(`results[1]: ${results[1]}`);
        logger.info(`parse int: ${parseInt(8, 10)}`);

        const oldTrades = [];
        for (let i = 0; i < results[0].length; i++) {
          const curTrade = results[0][i];
          const newItems = [];
          const newItemsPartner = [];
          if (!curTrade.items) curTrade.items = [];
          if (!curTrade.itemsPartner) curTrade.itemsPartner = [];
          curTrade.itemsPartner = newItemsPartner;
          curTrade.items = newItems;
          oldTrades.push(curTrade);
        }
        logger.info(`oldTrades: ${oldTrades.length}`);
        done();
      });
    });

    it('It should success', done => {
      request
        .post('/api/trade/v2/getTrades')
        .set('x-access-token', 'iECTMw_MYN5cDBdsXjhSHVTAL0g6KfoQvPL_B0Mcm0qGcGO58Zv93fKcOXdJXicJ')
        .send({
          offset: '0',
          limit: '8',
        })
        .timeout(100000)
        .expect(200)
        .end((error, response) => {
          should.not.exist(error);
          response.status.should.equal(200);
          logger.info(Object.keys(response.body.trades));
          logger.info('trades:', response.body.trades.length);
          done();
        });
    });
  });
});
