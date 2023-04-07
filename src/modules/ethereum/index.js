const hdkey = require('ethereumjs-wallet').hdkey;
const bip39 = require('bip39');

const User = require('../../models/User');
const etherWalletData = require('./etherWalletData');

module.exports = async (req, res) => {
  const user = req.user;
  let etherAddress = user.etherAddress;
  if (!etherAddress) {
    const etherIndex = (await User.countDocuments({ etherAddress: { $ne: null } })) + 1;
    const hdWallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(etherWalletData.mnemonic));
    const wallet = hdWallet.derivePath(`m/44'/60'/0'/0/${etherIndex}`).getWallet();
    etherAddress = wallet.getAddressString();
    await User.updateMany({ steamId: req.user.steamId }, { $set: { etherAddress, etherIndex } });
  }

  res.send({ status: 'success', result: etherAddress });
};
