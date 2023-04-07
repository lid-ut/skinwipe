const fetch = require('node-fetch');
const xml2js = require('xml2js');
const Settings = require('../models/Settings');

module.exports = async () => {
  const dateObj = new Date();
  const month = `0${dateObj.getUTCMonth() + 1}`.slice(-2);
  const day = `0${dateObj.getUTCDate()}`.slice(-2);
  const fullYear = dateObj.getUTCFullYear();
  const res = await fetch(`http://www.cbr.ru/scripts/XML_daily.asp?date_req=${day}/${month}/${fullYear}`);

  const text = await res.text();
  const settings = await Settings.findOne();

  try {
    const parser = new xml2js.Parser();
    const data = await parser.parseStringPromise(text);
    if (data && data.ValCurs && data.ValCurs.Valute) {
      const usd = data.ValCurs.Valute.filter(it => it.CharCode.indexOf('USD') !== -1)[0];
      if (usd) {
        const val = parseFloat(usd.Value[0].replace(',', '.'));
        if (val && val > 0) {
          settings.USDtoRUB = Math.floor((val + (val / 100) * 3) * 100) / 100;
          await settings.save();
        }
      }
    }
  } catch (e) {
    console.error(`[getUSDRate.js] error: ${e.toString()}`);
  }

  return settings.USDtoRUB;
};
