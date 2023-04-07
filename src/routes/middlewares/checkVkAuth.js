module.exports = async function checkXAccessToken(req, res) {
  const xat = req.headers['vk-game-token'];

  if (xat === 'dAdd@#41dadm$$@3EDSQW') {
    return;
  }
  res
    .status(403)
    .send('NIE GRAZJDANIN!')
    .end();
};
