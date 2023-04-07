const getSpecialOffers =  require('../../controllers/UserController').getSpecialOffers;

module.exports = async function getSpecialoffers(req, res) {
    let specialOffers = getSpecialOffers(req.user);
    res.json({ status: 'success', result: specialOffers });
}