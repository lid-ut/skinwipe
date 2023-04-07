module.exports = async function checkSupportToken(req, res) {
  let xat = req.headers.token;
  if (!xat && req.cookies && req.cookies.token) {
    xat = req.cookies.token;
  }
  if (!xat || xat !== 'ytvs4bGUeUFQL63q11') {
    res.status(403).send('FORBIDDEN!').end();
  }
};
