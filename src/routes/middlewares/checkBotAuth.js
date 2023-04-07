module.exports = async function checkXAccessToken(req, res) {
  const xat = req.headers['backmaster-token'];

  if (xat === 'sd1dDAsd13d1@#!!#Dsdqw') {
    return;
  }
  res
    .status(403)
    .send('NIE GRAZJDANIN!')
    .end();
};
