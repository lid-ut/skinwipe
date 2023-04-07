const Promocode = require('../../models/Promocode');

module.exports = async (req, res) => {
  // console.log(req.body);
  // eslint-disable-next-line camelcase
  const vk_id = req.body.vk_id;
  const promo = req.body.promo;
  // eslint-disable-next-line camelcase
  const code_type = req.body.code_type;
  const amount = req.body.amount;

  let promocode = await Promocode.findOne({ promo });

  if (promocode) {
    res.send({ status: 'error' });
    return;
  }

  promocode = new Promocode({
    vk_id,
    promo,
    code_type,
    amount,
  });

  if (req.body.daysLimit && req.body.daysLimit > 0) {
    promocode.validTo = new Date(Date.now() + req.body.daysLimit * 24 * 60 * 60 * 1000);
  }

  await promocode.save();

  res.send({ status: 'success' });
};
