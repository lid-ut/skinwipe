const keythereum = require('keythereum');

function createWallet(password) {
  const params = { keyBytes: 32, ivBytes: 16 };
  const dk = keythereum.create(params);

  const options = {
    kdf: 'pbkdf2',
    cipher: 'aes-128-ctr',
    kdfparams: { c: 262144, dklen: 32, prf: 'hmac-sha256' },
  };
  return keythereum.dump(password, dk.privateKey, dk.salt, dk.iv, options);
}
/* for getting private key from keyObject */
function getPrivateKey(password, keyObject) {
  return keythereum.recover(password, keyObject);
}

const keyObject = createWallet('Titbit98');
const walletAddress = '0x' + keyObject.address;

const privateKey = getPrivateKey('Titbit98', keyObject);

console.log(walletAddress);
console.log(privateKey);
