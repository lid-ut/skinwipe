const xml2js = require('xml2js');
const Best2Pay = require('../../../models/Best2Pay');
const changeMoney = require('../../../helpers/changeMoney');

module.exports = async (req, res) => {
  const parser = new xml2js.Parser();
  try {
    const resultReg = await parser.parseStringPromise(req.body);
    const id = resultReg.operation.order_id[0];
    const best2Pay = await Best2Pay.findOne({ id });

    if (!best2Pay) {
      return;
    }

    if (
      resultReg.operation.order_state[0] === 'CANCELED' ||
      resultReg.operation.order_state[0] === 'BLOCKED' ||
      resultReg.operation.order_state[0] === 'EXPIRED'
    ) {
      best2Pay.status = 'close';
      await best2Pay.save();
      return;
    }

    if (resultReg.operation.order_state[0] === 'COMPLETED') {
      best2Pay.status = 'done';
      await best2Pay.save();
      // await changeMoney(req.user, 'done', id, best2Pay.amountBase, { type: 'pay', status: 'in', store: 'best2pay' });
      res.send('ok');
    }
  } catch (e) {
    console.log(e.toString());
  }

  res.end();
};
