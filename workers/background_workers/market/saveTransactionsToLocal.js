const fs = require('fs');
const MoneyTransaction = require('../../../src/models/MoneyTransaction');

module.exports = async callback => {
  const transactions = await MoneyTransaction.find({}).lean();
  console.log(`all loaded ${transactions.length}`);
  if (transactions.length > 0) {
    const json = JSON.stringify(transactions);
    fs.writeFile('moneytransactions.json', json, 'utf8', () => {
      console.log('done');
    });
  }
  callback();
};
