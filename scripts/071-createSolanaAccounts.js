require('../logger');
const solanaWeb3 = require('@solana/web3.js');

(async () => {
  //let account = new solanaWeb3.Account();
  //console.log(account, account.publicKey, account.secretKey);
  console.log(new solanaWeb3.Connection());
  let amount = solanaWeb3.TokenAmount({
    amount: 10,
    decimals: 0,
  });
  console.log(amount);
  console.log('done');
})();
