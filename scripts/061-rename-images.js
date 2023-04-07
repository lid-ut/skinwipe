require('../logger');
const { Builder, By, Key, until, FileHandler, Capabilities, ChromeOptions } = require('selenium-webdriver');
let webdriver = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');

const ItemImage = require('../src/models/ItemImage');
const randomUseragent = require('random-useragent');
const fs = require('fs');
const fetch = require('node-fetch');

(async function main() {
  let images = await ItemImage.find({});
  for (let i = 0; i < images.length; i++) {
    let image = images[i];
    //console.log(`${__dirname}/../${image.imageUrl}`, `${__dirname}/../img/skins/${image.type}_${image.skinName}.png`);
    if (!fs.existsSync(`${__dirname}/../public/${image.imageUrl}`)) {
      continue;
    }
    fs.renameSync(`${__dirname}/../public/${image.imageUrl}`, `${__dirname}/../public/img/skins/${image.type}_${image.skinName}.png`);
    image.imageUrl = `img/skins/${image.type}_${image.skinName}.png`;
    await ItemImage.updateOne({ _id: image._id }, image);
  }
})();
