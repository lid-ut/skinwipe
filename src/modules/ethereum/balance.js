const Web3 = require('web3');
const User = require('../../models/User');
const getEtherRate = require('../../helpers/getEtherRate');

module.exports = async (req, res) => {
  const user = req.user;
  const etherRate = await getEtherRate();
  let usd = 0;

  if (user.etherAddress && user.etherPrivateKey) {
    const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/9119a81222b94754bc097b833dc1eb78'));
    const result = await web3.eth.getBalance(user.etherAddress);
    user.etherBalance = web3.utils.fromWei(result, 'ether');
    usd = user.etherBalance * etherRate * 0.97;

    await User.updateMany({ steamId: user.steamId }, { $set: { etherBalance: user.etherBalance } });
  }

  res.send({ status: 'success', result: { eth: `${user.etherBalance} ETH`, usd } });
};
