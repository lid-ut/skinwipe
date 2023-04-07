const fetch = require('node-fetch');
const { base64encode } = require('nodejs-base64');
const xml2js = require('xml2js');
const Best2Pay = require('../../../models/Best2Pay');
const getUSDRate = require('../../../helpers/getUSDRate');
const config = require('../../../../config');
const md5hex = require('../../../modules/md5-hex');

module.exports = async req => {
  const parser = new xml2js.Parser();
  let amount = parseInt(req.params.amount, 10) || 100;
  const baseAmount = amount;
  if (amount < 2) {
    return {
      status: 'error',
      code: 1,
    };
  }
  const usdrate = await getUSDRate();
  amount *= usdrate;
  amount = Math.round(amount);

  const currency = req.query.currency || 643;

  const description = 'SkinSwipe balance add';

  let signatureReg = md5hex(`${config.best2pay.sector}${amount}${currency}${config.best2pay.password}`);
  signatureReg = base64encode(signatureReg);

  const best2PayRegister = await fetch(
    `https://test.best2pay.net/webapi/Register?sector=${config.best2pay.sector}&amount=${amount}&currency=${currency}&signature=${signatureReg}&description=${description}`,
  );

  if (!best2PayRegister || best2PayRegister.status !== 200) {
    return {
      status: 'error',
      code: best2PayRegister.status,
    };
  }
  const textReg = await best2PayRegister.text();
  const resultReg = await parser.parseStringPromise(textReg);

  const best2Pay = new Best2Pay({
    id: resultReg.order.id[0],
    status: 'new',
    steamId: req.user.steamId,
    description,
    product: 'market',
    amount,
    baseAmount,
    currency,
  });
  await best2Pay.save();

  let signaturePur = md5hex(`${config.best2pay.sector}${resultReg.order.id[0]}${config.best2pay.password}`);
  signaturePur = base64encode(signaturePur);

  const best2PayPurchase = await fetch(
    `https://test.best2pay.net/webapi/CardEnroll?sector=${config.best2pay.sector}&id=${resultReg.order.id[0]}&signature=${signaturePur}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  );

  if (!best2PayPurchase || best2PayPurchase.status !== 200) {
    return {
      status: 'error',
      code: best2PayPurchase.status,
    };
  }
  return {
    status: 'success',
    result: best2PayPurchase.url,
  };
};
