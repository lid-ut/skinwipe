module.exports = async function checkBan(req, res) {
  if (!req.user) {
    res.status(500).send('only req.user provided!').end();
    return;
  }
  const partnerSteamID = req.body.partnerSteamID;
  if (partnerSteamID) {
    if (req.user.blacklist.indexOf(it => it === partnerSteamID) !== -1) {
      res.status(500).send('you are in black list!').end();
    }
  }
};
