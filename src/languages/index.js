const ru = require('./ru');
const en = require('./en');
const es = require('./es');
const cn = require('./cn');

module.exports = l => {
  switch (l) {
    case 'ru':
      return ru;
    case 'uz':
      return ru;
    case 'kg':
      return ru;
    case 'kz':
      return ru;
    case 'ua':
      return ru;
    case 'uk':
      return ru;
    case 'by':
      return ru;
    case 'en':
      return en;
    case 'es':
      return es;
    case 'cn':
      return cn;
    default:
      return en;
  }
};
